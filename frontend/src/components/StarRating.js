export default function StarRating({ value, onChange, max = 5 }) {
  return (
    <div>
      {Array.from({ length: max }, (_, i) => {
        const v = i + 1;
        const filled = v <= value;
        return (
          <span
            key={v}
            style={{ cursor: onChange ? 'pointer' : 'default', fontSize: 24 }}
            onClick={() => onChange && onChange(v)}
          >
            {filled ? '★' : '☆'}
          </span>
        );
      })}
    </div>
  );
}
