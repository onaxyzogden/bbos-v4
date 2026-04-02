import './AttributeCard.css';

export default function AttributeCard({ attr, color }) {
  if (!attr) return null;

  return (
    <div className="attr-card" style={{ borderLeftColor: color + '66' }}>
      <div className="attr-card-header">
        <span className="attr-card-name" style={{ color: color + 'dd' }}>
          {attr.name}
        </span>
        <span className="attr-card-title">
          {attr.title}
        </span>
      </div>
      <div className="attr-card-body">
        {attr.body}
      </div>
    </div>
  );
}
