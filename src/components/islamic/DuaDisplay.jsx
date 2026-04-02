import './DuaDisplay.css';

export default function DuaDisplay({ dua, color }) {
  if (!dua) return null;

  return (
    <div className="dua" style={{ borderColor: color + '18', background: `linear-gradient(135deg, ${color}08, ${color}03)` }}>
      <div className="dua-title" style={{ color: color + 'aa' }}>
        {dua.title}
      </div>

      <div className="dua-arabic arabic">
        {dua.arabic}
      </div>

      <div className="dua-trans">
        {dua.trans}
      </div>

      <div className="dua-meaning" style={{ borderLeftColor: color + '33' }}>
        {dua.meaning}
      </div>

      <div className="dua-source" style={{ color: color + '88' }}>
        {dua.source}
      </div>
    </div>
  );
}
