import {
  bufferToHexaString,
  hexaStringToBuffer,
} from "@ledgerhq/device-management-kit";
import { type Factory, inject, injectable } from "inversify";
import { Either, Just, Left, Maybe, Nothing, Right } from "purify-ts";

import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { type LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { INDEXED_DB_VERSION, STORAGE_KEYS } from "../model/constant.js";
import {
  StorageIDBErrors,
  StorageIDBGetError,
  StorageIDBNotInitializedError,
  StorageIDBOpenError,
  StorageIDBRemoveError,
  StorageIDBStoreError,
} from "../model/errors.js";
import { type UserConsent } from "../model/UserConsent.js";
import { type IndexedDbService } from "./IndexedDbService.js";

@injectable()
export class DefaultIndexedDbService implements IndexedDbService {
  private readonly logger: LoggerPublisher;
  private initialization: Maybe<Promise<void>> = Nothing;
  private idb: Either<StorageIDBErrors, IDBDatabase> = Left(
    new StorageIDBNotInitializedError("IDB not initialized"),
  );

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    private readonly loggerFactory: Factory<LoggerPublisher>,
  ) {
    this.logger = this.loggerFactory("[IndexedDB Service]");
  }

  async initIdb(): Promise<Either<StorageIDBErrors, IDBDatabase>> {
    if (this.idb.isRight()) {
      return this.idb;
    }

    if (this.initialization.isJust()) {
      await this.initialization.orDefault(Promise.resolve());
      return this.idb;
    }

    this.initialization = Just(
      new Promise((resolve) => {
        const request = indexedDB.open(
          STORAGE_KEYS.DB_NAME,
          INDEXED_DB_VERSION,
        );

        request.onsuccess = (event) => {
          this.logger.debug("IDB opened");
          const idb = (event.target as IDBOpenDBRequest).result;
          resolve(Right(idb));
        };

        request.onerror = (event) => {
          this.logger.error("Error opening IDB", { event });
          resolve(
            Left(new StorageIDBOpenError("Error opening IDB", { event })),
          );
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const store = db.createObjectStore(STORAGE_KEYS.DB_STORE_NAME);

          store.createIndex(
            STORAGE_KEYS.DB_STORE_KEYPAIR_KEY,
            STORAGE_KEYS.DB_STORE_KEYPAIR_KEY,
            { unique: true },
          );

          store.createIndex(
            STORAGE_KEYS.ENCRYPTION_KEY,
            STORAGE_KEYS.ENCRYPTION_KEY,
            { unique: true },
          );
        };
      }).then((result) => {
        if (Either.isEither(result)) {
          this.idb = result as Either<StorageIDBErrors, IDBDatabase>;
        }
        return;
      }),
    );

    await this.initialization.orDefault(Promise.resolve());
    return this.idb;
  }

  async storeKeyPair(
    keyPair: Uint8Array,
  ): Promise<Either<StorageIDBErrors, boolean>> {
    const encryptedKeyPairString = bufferToHexaString(keyPair);
    this.logger.debug("Storing encrypted keyPair in storage", {
      keyPair: encryptedKeyPairString,
    });
    const init = await this.initIdb();
    return new Promise<Either<StorageIDBErrors, boolean>>((resolve) => {
      init.map((db) => {
        const transaction = db.transaction(
          STORAGE_KEYS.DB_STORE_NAME,
          "readwrite",
        );
        const store = transaction.objectStore(STORAGE_KEYS.DB_STORE_NAME);
        const request = store.add(
          encryptedKeyPairString,
          STORAGE_KEYS.DB_STORE_KEYPAIR_KEY,
        );

        request.onsuccess = () => {
          this.logger.debug("KeyPair stored", {
            keyPair: bufferToHexaString(keyPair),
          });
          resolve(Right(true));
        };

        request.onerror = (event) => {
          this.logger.error("Error storing key pair", { event });
          resolve(
            Left(
              new StorageIDBStoreError("Error storing key pair", {
                event,
                keyPair: encryptedKeyPairString,
              }),
            ),
          );
        };
      });
    });
  }

  async getKeyPair(): Promise<Either<StorageIDBErrors, Uint8Array>> {
    const init = await this.initIdb();

    return new Promise<Either<StorageIDBErrors, Uint8Array>>((resolve) => {
      init.map((db) => {
        const transaction = db.transaction(
          STORAGE_KEYS.DB_STORE_NAME,
          "readonly",
        );
        const store = transaction.objectStore(STORAGE_KEYS.DB_STORE_NAME);
        const request = store.get(STORAGE_KEYS.DB_STORE_KEYPAIR_KEY);

        request.onsuccess = (event) => {
          const result = (event.target as IDBRequest)?.result;

          if (!result) {
            this.logger.error("Error getting key pair from indexDB", { event });
            resolve(
              Left(new StorageIDBGetError("Error getting key pair", { event })),
            );

            return;
          }

          this.logger.info("KeyPair retrieved from indexDB", {
            keyPair: result,
          });

          resolve(Right(hexaStringToBuffer(result) as Uint8Array));
        };

        request.onerror = (event) => {
          this.logger.error("Error getting key pair", { event });
          resolve(
            Left(
              new StorageIDBGetError("Error getting key pair", {
                event,
              }),
            ),
          );
        };
      });
    });
  }

  async removeKeyPair(): Promise<Either<StorageIDBErrors, boolean>> {
    const init = await this.initIdb();

    return new Promise<Either<StorageIDBErrors, boolean>>((resolve) => {
      init.map((db) => {
        const transaction = db.transaction(
          STORAGE_KEYS.DB_STORE_NAME,
          "readwrite",
        );
        const store = transaction.objectStore(STORAGE_KEYS.DB_STORE_NAME);
        const request = store.delete(STORAGE_KEYS.DB_STORE_KEYPAIR_KEY);

        request.onsuccess = () => {
          this.logger.debug("Key pair removed");
          resolve(Right(true));
        };

        request.onerror = (event) => {
          this.logger.error("Error removing key pair", { event });
          resolve(
            Left(
              new StorageIDBRemoveError("Error removing key pair", { event }),
            ),
          );
        };
      });
    });
  }

  async storeEncryptionKey(encryptionKey: CryptoKey): Promise<void> {
    const init = await this.initIdb();

    return new Promise<void>((resolve, reject) => {
      init
        .map((db) => {
          const transaction = db.transaction(
            STORAGE_KEYS.DB_STORE_NAME,
            "readwrite",
          );
          const store = transaction.objectStore(STORAGE_KEYS.DB_STORE_NAME);

          const request = store.put(encryptionKey, STORAGE_KEYS.ENCRYPTION_KEY);

          request.onsuccess = () => {
            this.logger.debug("Encryption key stored successfully");
            resolve();
          };

          request.onerror = (event) => {
            this.logger.error("Error storing encryption key", { event });
            reject(new Error("Failed to store encryption key"));
          };
        })
        .caseOf({
          Left: (error) => {
            this.logger.error(
              "Error initializing IDB for encryption key storage",
              { error },
            );
            reject(error);
          },
          Right: () => {
            // Transaction handled in map callback
          },
        });
    });
  }

  async getEncryptionKey(): Promise<Maybe<CryptoKey>> {
    const init = await this.initIdb();

    return new Promise<Maybe<CryptoKey>>((resolve) => {
      init
        .map((db) => {
          const transaction = db.transaction(
            STORAGE_KEYS.DB_STORE_NAME,
            "readonly",
          );
          const store = transaction.objectStore(STORAGE_KEYS.DB_STORE_NAME);
          const request = store.get(STORAGE_KEYS.ENCRYPTION_KEY);

          request.onsuccess = (event) => {
            const result = (event.target as IDBRequest)?.result;
            if (result && result instanceof CryptoKey) {
              this.logger.debug("Encryption key retrieved successfully");
              resolve(Just(result));
            } else {
              this.logger.debug("No encryption key found in storage");
              resolve(Nothing);
            }
          };

          request.onerror = (event) => {
            this.logger.error("Error retrieving encryption key", { event });
            resolve(Nothing);
          };
        })
        .caseOf({
          Left: (error) => {
            this.logger.error(
              "Error initializing IDB for encryption key retrieval",
              { error },
            );
            resolve(Nothing);
          },
          Right: () => {
            // Transaction handled in map callback
          },
        });
    });
  }

  async setDbVersion(version: number): Promise<Either<StorageIDBErrors, void>> {
    const init = await this.initIdb();

    return new Promise<Either<StorageIDBErrors, void>>((resolve) => {
      init
        .map((db) => {
          const transaction = db.transaction(
            STORAGE_KEYS.DB_STORE_NAME,
            "readwrite",
          );
          const store = transaction.objectStore(STORAGE_KEYS.DB_STORE_NAME);
          const request = store.put(version, STORAGE_KEYS.DB_VERSION);

          request.onsuccess = () => {
            this.logger.debug("DB version stored in IndexedDB", { version });
            resolve(Right(undefined));
          };

          request.onerror = (event) => {
            this.logger.error("Error storing DB version in IndexedDB", {
              event,
              version,
            });
            resolve(
              Left(
                new StorageIDBStoreError("Error storing DB version", {
                  event,
                  version,
                }),
              ),
            );
          };
        })
        .caseOf({
          Left: (error) => {
            this.logger.error("Error initializing IDB for DB version storage", {
              error,
            });
            resolve(Left(error));
          },
          Right: () => {
            // Transaction handled in map callback
          },
        });
    });
  }

  async getDbVersion(): Promise<Either<StorageIDBErrors, Maybe<number>>> {
    const init = await this.initIdb();

    return new Promise<Either<StorageIDBErrors, Maybe<number>>>((resolve) => {
      init
        .map((db) => {
          const transaction = db.transaction(
            STORAGE_KEYS.DB_STORE_NAME,
            "readonly",
          );
          const store = transaction.objectStore(STORAGE_KEYS.DB_STORE_NAME);
          const request = store.get(STORAGE_KEYS.DB_VERSION);

          request.onsuccess = (event) => {
            const result = (event.target as IDBRequest)?.result;
            if (result !== undefined && typeof result === "number") {
              this.logger.debug("DB version retrieved from IndexedDB", {
                version: result,
              });
              resolve(Right(Just(result)));
            } else {
              this.logger.debug("No DB version found in IndexedDB");
              resolve(Right(Nothing));
            }
          };

          request.onerror = (event) => {
            this.logger.error("Error retrieving DB version from IndexedDB", {
              event,
            });
            resolve(
              Left(
                new StorageIDBGetError("Error retrieving DB version", {
                  event,
                }),
              ),
            );
          };
        })
        .caseOf({
          Left: (error) => {
            this.logger.error(
              "Error initializing IDB for DB version retrieval",
              { error },
            );
            resolve(Left(error));
          },
          Right: () => {
            // Transaction handled in map callback
          },
        });
    });
  }

  async storeUserConsent(
    consent: UserConsent,
  ): Promise<Either<StorageIDBErrors, void>> {
    const init = await this.initIdb();

    return new Promise<Either<StorageIDBErrors, void>>((resolve) => {
      init
        .map((db) => {
          const transaction = db.transaction(
            STORAGE_KEYS.DB_STORE_NAME,
            "readwrite",
          );
          const store = transaction.objectStore(STORAGE_KEYS.DB_STORE_NAME);
          const request = store.put(consent, STORAGE_KEYS.USER_CONSENT);

          request.onsuccess = () => {
            this.logger.debug("User consent stored in IndexedDB", { consent });
            resolve(Right(undefined));
          };

          request.onerror = (event) => {
            this.logger.error("Error storing user consent in IndexedDB", {
              event,
              consent,
            });
            resolve(
              Left(
                new StorageIDBStoreError("Error storing user consent", {
                  event,
                  consent,
                }),
              ),
            );
          };
        })
        .caseOf({
          Left: (error) => {
            this.logger.error(
              "Error initializing IDB for user consent storage",
              { error },
            );
            resolve(Left(error));
          },
          Right: () => {
            // Transaction handled in map callback
          },
        });
    });
  }

  async getUserConsent(): Promise<
    Either<StorageIDBErrors, Maybe<UserConsent>>
  > {
    const init = await this.initIdb();

    return new Promise<Either<StorageIDBErrors, Maybe<UserConsent>>>(
      (resolve) => {
        init
          .map((db) => {
            const transaction = db.transaction(
              STORAGE_KEYS.DB_STORE_NAME,
              "readonly",
            );
            const store = transaction.objectStore(STORAGE_KEYS.DB_STORE_NAME);
            const request = store.get(STORAGE_KEYS.USER_CONSENT);

            request.onsuccess = (event) => {
              const result = (event.target as IDBRequest)?.result;
              if (result !== undefined) {
                this.logger.debug("User consent retrieved from IndexedDB", {
                  consent: result,
                });
                resolve(Right(Just(result)));
              } else {
                this.logger.debug("No user consent found in IndexedDB");
                resolve(Right(Nothing));
              }
            };

            request.onerror = (event) => {
              this.logger.error(
                "Error retrieving user consent from IndexedDB",
                {
                  event,
                },
              );
              resolve(
                Left(
                  new StorageIDBGetError("Error retrieving user consent", {
                    event,
                  }),
                ),
              );
            };
          })
          .caseOf({
            Left: (error) => {
              this.logger.error(
                "Error initializing IDB for user consent retrieval",
                { error },
              );
              resolve(Left(error));
            },
            Right: () => {
              // Transaction handled in map callback
            },
          });
      },
    );
  }

  async storeWelcomeScreenCompleted(
    completed: boolean,
  ): Promise<Either<StorageIDBErrors, void>> {
    const init = await this.initIdb();

    return new Promise<Either<StorageIDBErrors, void>>((resolve) => {
      init
        .map((db) => {
          const transaction = db.transaction(
            STORAGE_KEYS.DB_STORE_NAME,
            "readwrite",
          );
          const store = transaction.objectStore(STORAGE_KEYS.DB_STORE_NAME);
          const request = store.put(
            completed,
            STORAGE_KEYS.WELCOME_SCREEN_COMPLETED,
          );

          request.onsuccess = () => {
            this.logger.debug("Welcome screen status stored in IndexedDB", {
              completed,
            });
            resolve(Right(undefined));
          };

          request.onerror = (event) => {
            this.logger.error(
              "Error storing welcome screen status in IndexedDB",
              {
                event,
                completed,
              },
            );
            resolve(
              Left(
                new StorageIDBStoreError(
                  "Error storing welcome screen status",
                  {
                    event,
                    completed,
                  },
                ),
              ),
            );
          };
        })
        .caseOf({
          Left: (error) => {
            this.logger.error(
              "Error initializing IDB for welcome screen status storage",
              { error },
            );
            resolve(Left(error));
          },
          Right: () => {
            // Transaction handled in map callback
          },
        });
    });
  }

  async getWelcomeScreenCompleted(): Promise<
    Either<StorageIDBErrors, Maybe<boolean>>
  > {
    const init = await this.initIdb();

    return new Promise<Either<StorageIDBErrors, Maybe<boolean>>>((resolve) => {
      init
        .map((db) => {
          const transaction = db.transaction(
            STORAGE_KEYS.DB_STORE_NAME,
            "readonly",
          );
          const store = transaction.objectStore(STORAGE_KEYS.DB_STORE_NAME);
          const request = store.get(STORAGE_KEYS.WELCOME_SCREEN_COMPLETED);

          request.onsuccess = (event) => {
            const result = (event.target as IDBRequest)?.result;
            if (result !== undefined && typeof result === "boolean") {
              this.logger.debug(
                "Welcome screen status retrieved from IndexedDB",
                {
                  completed: result,
                },
              );
              resolve(Right(Just(result)));
            } else {
              this.logger.debug("No welcome screen status found in IndexedDB");
              resolve(Right(Nothing));
            }
          };

          request.onerror = (event) => {
            this.logger.error(
              "Error retrieving welcome screen status from IndexedDB",
              {
                event,
              },
            );
            resolve(
              Left(
                new StorageIDBGetError(
                  "Error retrieving welcome screen status",
                  {
                    event,
                  },
                ),
              ),
            );
          };
        })
        .caseOf({
          Left: (error) => {
            this.logger.error(
              "Error initializing IDB for welcome screen status retrieval",
              { error },
            );
            resolve(Left(error));
          },
          Right: () => {
            // Transaction handled in map callback
          },
        });
    });
  }
}
