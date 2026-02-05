import { ReactiveController, ReactiveControllerHost } from "lit";

export class ModalScrollLockController implements ReactiveController {
  private previousOverflow = "";
  private isLocked = false;

  constructor(private readonly host: ReactiveControllerHost) {
    this.host.addController(this);
  }

  hostDisconnected(): void {
    this.unlock();
  }

  lock(): void {
    if (this.isLocked) {
      return;
    }

    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    this.isLocked = true;
  }

  unlock(): void {
    if (!this.isLocked) {
      return;
    }

    document.body.style.overflow = this.previousOverflow;
    this.previousOverflow = "";
    this.isLocked = false;
  }
}
