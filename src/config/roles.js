const ROLES = {
  USER: 'user',
  CREATOR: 'creator',
  ADMIN: 'admin',
};

const roleRights = new Map();
roleRights.set(ROLES.USER, ['user']);
roleRights.set(ROLES.CREATOR, ['user', 'creator']);
roleRights.set(ROLES.ADMIN, ['creator', 'user', 'admin']);

module.exports = {
  ROLES,
  roleRights,
};
