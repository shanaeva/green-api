type Props = {
  apiTokenInstance: string;
  instanceId: string;
  onApiTokenInstanceChange: (value: string) => void;
  onInstanceIdChange: (value: string) => void;
};

export const ConnectionForm = ({
  apiTokenInstance,
  instanceId,
  onApiTokenInstanceChange,
  onInstanceIdChange,
}: Props) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-slate-900">Подключение</h2>
      <p className="mt-1 text-sm text-slate-500">
        Введи данные инстанса GREEN-API, чтобы начать переписку
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        Уникальный номер инстанса
        <input
          autoComplete="off"
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
          onChange={(event) => onInstanceIdChange(event.target.value)}
          placeholder="idInstance"
          value={instanceId}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        Ключ доступа инстанса
        <input
          autoComplete="new-password"
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
          onChange={(event) => onApiTokenInstanceChange(event.target.value)}
          placeholder="apiTokenInstance"
          type="password"
          value={apiTokenInstance}
        />
      </label>
    </div>
  </section>
);
