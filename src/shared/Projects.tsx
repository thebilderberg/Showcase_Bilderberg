import React, { useState } from 'react';
import { projects } from './config';
import { openExternal } from './telegram/webapp';

export function Projects({ compact = false }: { compact?: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className={`project-grid ${compact ? 'compact' : ''}`}>
      {projects.map((project) => (
        <article className={`project-card ${project.theme}`} key={project.id}>
          <div className="project-image">
            <img src={project.image} alt={project.category} loading="lazy" />
            <span>
              {project.number} / {project.category}
            </span>
          </div>
          <div className="project-copy">
            <div className="project-heading">
              <h3>{project.title}</h3>
              <span aria-hidden="true">↗</span>
            </div>
            <p>{project.description}</p>
            <div className="tags">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div className="project-actions">
              <button
                className="text-link"
                aria-expanded={expanded === project.id}
                aria-controls={`details-${project.id}`}
                onClick={() => setExpanded(expanded === project.id ? null : project.id)}
              >
                {expanded === project.id ? 'Свернуть описание −' : 'Что внутри проекта +'}
              </button>
              {project.url ? (
                <button className="text-link" onClick={() => openExternal(project.url!)}>
                  Открыть сайт ↗
                </button>
              ) : (
                <span className="project-status">Готовится к публикации</span>
              )}
            </div>
            {expanded === project.id && (
              <ul className="project-details" id={`details-${project.id}`}>
                {project.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
