import { type Factory, inject, injectable } from "inversify";

import { backendModuleTypes } from "../../backend/backendModuleTypes.js";
import type { BackendService } from "../../backend/BackendService.js";
import {
  type EventRequest,
  EventType,
} from "../../backend/model/trackEvent.js";
import { configModuleTypes } from "../../config/configModuleTypes.js";
import type { Config } from "../../config/model/config.js";
import { contextModuleTypes } from "../../context/contextModuleTypes.js";
import type { ContextService } from "../../context/ContextService.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import type { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { generateUUID } from "../utils.js";
import type { EventTrackingService } from "./EventTrackingService.js";

@injectable()
export class DefaultEventTrackingService implements EventTrackingService {
  private static readonly ALWAYS_TRACKED_EVENTS: EventType[] = [
    EventType.InvoicingTransactionSigned,
    EventType.ErrorOccurred,
    EventType.ConsentGiven,
  ];

  private readonly logger: LoggerPublisher;

  private _sessionId: string;
  private eventQueue: EventRequest[] = [];
  private isFlushing = false;

  constructor(
    @inject(backendModuleTypes.BackendService)
    private readonly backendService: BackendService,
    @inject(configModuleTypes.Config)
    private readonly config: Config,
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(contextModuleTypes.ContextService)
    private readonly contextService: ContextService,
  ) {
    this.logger = loggerFactory("[Event Tracking]");
    this._sessionId = generateUUID();
    this.subscribeToContextChanges();
  }

  getSessionId(): string {
    return this._sessionId;
  }

  async trackEvent(event: EventRequest): Promise<void> {
    try {
      if (this.isAlwaysTrackedEvent(event)) {
        await this.processEvent(event);
        return;
      }
  
      const consentStatus = this.getConsentStatus();
  
      if (this.isFlushing && consentStatus === true) {
        this.eventQueue.push(event);
        this.logger.debug("Event queued (queue flushing in progress)", { event });
        return;
      }
  
      if (consentStatus === true) {
        await this.processEvent(event);
        return;
      }
  
      if (consentStatus === undefined) {
        this.eventQueue.push(event);
        this.logger.debug("Event queued (waiting for consent)", { event });
        return;
      }
  
      this.logger.debug("Event discarded (consent refused)", { event });
    } catch (error) {
      this.logger.error("Error tracking event", { error, event });
    }
  }
  

  private isAlwaysTrackedEvent(event: EventRequest): boolean {
    return DefaultEventTrackingService.ALWAYS_TRACKED_EVENTS.includes(
      event.type,
    );
  }

  private getConsentStatus(): boolean | undefined {
    return this.contextService.getContext().hasTrackingConsent;
  }

  private async processEvent(event: EventRequest): Promise<void> {
    /*
TODO: Uncomment this when we have a validation for the events in the backend.
Check current state with formats in JSON schemas and update the validation.

    const validationResult = EventTrackingUtils.validateEvent(event);

    if (!validationResult.success) {
      this.logger.error("Event validation failed", {
        eventType: event.type,
        errors: validationResult.errors,
        event,
      });
      return;
    }
*/

    this.logger.info("Tracking event", { event });

    //TODO: Uncomment this when we have a validation for the events in the backend.
    const result = await this.backendService.event(
      event,
      this.config.dAppIdentifier,
    );

    result.caseOf({
      Left: (error) => {
        this.logger.error("Failed to track event", { error, event });
      },
      Right: (response) => {
        this.logger.debug("Event tracked successfully", { response });
      },
    });
  }

  private subscribeToContextChanges(): void {
    this.contextService.observeContext().subscribe((context) => {
      if (context.hasTrackingConsent === true) {
        this.flushQueue();
      } else if (context.hasTrackingConsent === false) {
        this.clearQueue();
      }
    });
  }

  private async flushQueue(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    this.isFlushing = true;

    try {
      const eventsToProcess = [...this.eventQueue];
      this.eventQueue = [];

      this.logger.info(`Flushing ${eventsToProcess.length} queued events`);

      for (const event of eventsToProcess) {
        await this.processEvent(event);
      }

      if (this.eventQueue.length > 0) {
        const eventsDuringFlush = [...this.eventQueue];
        this.eventQueue = [];
        this.logger.info(
          `Processing ${eventsDuringFlush.length} events queued during flush`,
        );

        for (const event of eventsDuringFlush) {
          await this.processEvent(event);
        }
      }
    } finally {
      this.isFlushing = false;
    }
  }

  private clearQueue(): void {
    const queueSize = this.eventQueue.length;
    if (queueSize > 0) {
      this.logger.debug(`Clearing ${queueSize} queued events (consent refused)`);
      this.eventQueue = [];
    }
  }
}