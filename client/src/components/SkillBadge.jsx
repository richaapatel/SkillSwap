const SkillBadge = ({ skill, variant = 'offered', removable = false, onRemove }) => {
  const badgeClass = variant === 'wanted' ? 'badge-skill badge-skill-accent' : 'badge-skill';

  return (
    <span className={badgeClass}>
      {skill.name}
      {removable && (
        <button
          type="button"
          className="skill-badge-remove"
          onClick={() => onRemove(skill)}
          aria-label={`Remove ${skill.name}`}
        >
          <i className="bi bi-x" aria-hidden="true"></i>
        </button>
      )}
    </span>
  );
};

export default SkillBadge;
