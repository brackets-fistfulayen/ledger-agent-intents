import { Observable } from "rxjs";

import { type ContextEvent } from "./model/ContextEvent.js";
import type { ButtonCoreContext } from "../../api/model/ButtonCoreContext.js";

export interface ContextService {
  observeContext(): Observable<ButtonCoreContext>;
  getContext(): ButtonCoreContext;
  onEvent(event: ContextEvent): void;
}
