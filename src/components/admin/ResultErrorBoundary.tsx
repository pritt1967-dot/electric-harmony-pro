import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type Props = { children: ReactNode; title?: string; message?: string };
type State = { hasError: boolean };

/**
 * Локальная защита блока результата: ошибка внутри дочернего блока
 * не должна скрывать весь результат проектирования.
 */
export class ResultErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[PanelDesigner] Ошибка блока результата:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 sm:p-6">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            {this.props.title ?? "Блок временно недоступен"}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {this.props.message ??
              "Не удалось построить чертёж. Основные данные проекта доступны."}
          </p>
        </section>
      );
    }
    return this.props.children;
  }
}
