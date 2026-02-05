import { ContainerModule, Factory } from "inversify";

import { ConsoleLoggerSubscriber } from "./service/ConsoleLoggerSubscriber.js";
import { DefaultLoggerPublisher } from "./service/DefaultLoggerPublisher.js";
import { ErrorTrackingLoggerSubscriber } from "./service/ErrorTrackingLoggerSubscriber.js";
import { LoggerPublisher } from "./service/LoggerPublisher.js";
import { LoggerSubscriber } from "./service/LoggerSubscriber.js";
import { configModuleTypes } from "../config/configModuleTypes.js";
import type { Config } from "../config/model/config.js";
import type { ErrorTrackingConfig } from "../event-tracking/config/ErrorTrackingConfig.js";
import { eventTrackingModuleTypes } from "../event-tracking/eventTrackingModuleTypes.js";
import type { EventTrackingService } from "../event-tracking/service/EventTrackingService.js";
import { loggerModuleTypes } from "./loggerModuleTypes.js";

type LoggerModuleOptions = {
  stub?: boolean;
  errorTrackingConfig?: ErrorTrackingConfig;
};

export function loggerModuleFactory({
  stub,
  errorTrackingConfig,
}: LoggerModuleOptions = {}) {
  return new ContainerModule(({ bind }) => {
    bind<LoggerSubscriber>(loggerModuleTypes.LoggerSubscriber).to(
      ConsoleLoggerSubscriber,
    );

    if (errorTrackingConfig?.enabled !== false) {
      bind<LoggerSubscriber>(loggerModuleTypes.LoggerSubscriber)
        .toDynamicValue((context) => {
          // Use lazy resolution to avoid circular dependency:
          // EventTrackingService → Logger → ErrorTrackingLoggerSubscriber → EventTrackingService
          const getSessionId = () =>
            context
              .get<EventTrackingService>(
                eventTrackingModuleTypes.EventTrackingService,
              )
              .getSessionId();
          const getDAppId = () =>
            context.get<Config>(configModuleTypes.Config).dAppIdentifier;
          const trackEvent = (
            event: Parameters<EventTrackingService["trackEvent"]>[0],
          ) =>
            context
              .get<EventTrackingService>(
                eventTrackingModuleTypes.EventTrackingService,
              )
              .trackEvent(event);
          return new ErrorTrackingLoggerSubscriber({
            sessionId: getSessionId,
            dAppId: getDAppId,
            trackEvent,
            config: errorTrackingConfig,
          });
        })
        .inSingletonScope();
    }

    // NOTE: Can multibind here if we need other types of loggers (exporter, etc)
    bind<Factory<LoggerPublisher>>(loggerModuleTypes.LoggerPublisher).toFactory(
      (context) => {
        return (tag: string) => {
          const subscribers = context.getAll<LoggerSubscriber>(
            loggerModuleTypes.LoggerSubscriber,
          );
          return new DefaultLoggerPublisher(subscribers, tag);
        };
      },
    );

    if (stub) {
      // rebindSync(loggerModuleTypes.LoggerPublisher).toConstantValue({
      //   // TODO: Implement stub
      // });
      // rebindSync(loggerModuleTypes.LoggerSubscriber).toConstantValue({
      //   // TODO: Implement stub
      // });
    }
  });
}
