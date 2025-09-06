import api from '../lib/api';

export const listProjects = async () => {
  const res = await api.get('/v1/projects');
  return res.data;
};

export default {
  listProjects,
};
