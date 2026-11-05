// Campo de formulário simples (rótulo + input/textarea/select)
export default function Field({ label, type = 'text', value, onChange, options, ...rest }) {
  const id = `f-${label}`;
  if (type === 'checkbox') {
    return (
      <label className="check" htmlFor={id}>
        <input id={id} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} {...rest} />
        {label}
      </label>
    );
  }
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {type === 'textarea' ? (
        <textarea id={id} rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />
      ) : type === 'select' ? (
        <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest}>
          <option value="">Selecione…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input id={id} type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />
      )}
    </div>
  );
}
