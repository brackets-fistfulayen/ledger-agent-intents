import { Observable } from 'rxjs';
import { ContextEvent } from './model/ContextEvent.js';
import { ButtonCoreContext } from '../../api/model/ButtonCoreContext.js';
export interface ContextService {
    observeContext(): Observable<ButtonCoreContext>;
    getContext(): ButtonCoreContext;
    onEvent(event: ContextEvent): void;
}
//# sourceMappingURL=ContextService.d.ts.map