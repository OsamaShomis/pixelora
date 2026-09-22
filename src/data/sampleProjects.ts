export {
  DEFAULT_FILTERS,
  INITIAL_EDITOR_STATE,
  SAMPLE_PROJECTS,
} from './sampleProjectsData';

export {
  READY_PROJECT_TEMPLATES,
  READY_PROJECT_CATEGORIES,
  type ReadyProjectTemplate,
  type ReadyProjectCategory,
} from './readyProjectsData';

export {
  getSavedProjects,
  saveProjectToStorage,
  deleteProjectFromStorage,
  subscribeToProjects,
  sanitizeProject,
} from '../utils/projectStorage';
