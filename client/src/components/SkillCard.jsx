const SkillCard = ({
  skill,
  isAuthenticated,
  isOffered,
  isWanted,
  busyKey,
  onManage,
}) => {
  const skillId = skill._id;
  const isOfferedBusy = busyKey === `offered-${skillId}`;
  const isWantedBusy = busyKey === `wanted-${skillId}`;

  const manageSkill = (type, isSelected) => {
    onManage({
      action: isSelected ? 'remove' : 'add',
      skillId,
      type,
    });
  };

  return (
    <article className="skill-card card h-100">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <h3 className="skill-card-title">{skill.name}</h3>
            {skill.category && <span className="skill-category">{skill.category}</span>}
          </div>
          <i className="bi bi-lightbulb skill-card-icon" aria-hidden="true"></i>
        </div>

        <p className="skill-card-description">
          {skill.description || 'A skill waiting to be shared with the community.'}
        </p>

        {isAuthenticated ? (
          <div className="skill-card-actions mt-auto pt-3">
            <button
              type="button"
              className={`btn btn-sm ${isOffered ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => manageSkill('offered', isOffered)}
              disabled={isOfferedBusy || isWantedBusy}
              aria-pressed={isOffered}
            >
              {isOfferedBusy ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-label="Updating"></span>
              ) : (
                <i className={`bi ${isOffered ? 'bi-check2' : 'bi-easel2'} me-1`} aria-hidden="true"></i>
              )}
              {isOffered ? 'Offering' : 'Offer this'}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${isWanted ? 'btn-accent' : 'btn-outline-accent'}`}
              onClick={() => manageSkill('wanted', isWanted)}
              disabled={isOfferedBusy || isWantedBusy}
              aria-pressed={isWanted}
            >
              {isWantedBusy ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-label="Updating"></span>
              ) : (
                <i className={`bi ${isWanted ? 'bi-check2' : 'bi-bookmark-plus'} me-1`} aria-hidden="true"></i>
              )}
              {isWanted ? 'Learning' : 'Learn this'}
            </button>
          </div>
        ) : (
          <p className="skill-card-login mt-auto pt-3 mb-0">
            <i className="bi bi-person-plus me-1" aria-hidden="true"></i>
            Log in to add this skill to your profile.
          </p>
        )}
      </div>
    </article>
  );
};

export default SkillCard;
