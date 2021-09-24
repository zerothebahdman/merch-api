const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const User = require('../../src/models/user.model');
const { ROLES } = require('../../src/config/roles');
const { USER_STATUSES } = require('../../src/config/constants');
const { capitalCase } = require('../../src/utils/helpers');

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const userOne = {
  _id: mongoose.Types.ObjectId(),
  firstName: capitalCase(faker.name.firstName()),
  lastName: capitalCase(faker.name.lastName()),
  email: faker.internet.email().toLowerCase(),
  password,
  role: ROLES.USER,
  emailVerified: false,
  status: USER_STATUSES.INVITATION_SENT,
};

const userTwo = {
  _id: mongoose.Types.ObjectId(),
  firstName: capitalCase(faker.name.firstName()),
  lastName: capitalCase(faker.name.lastName()),
  email: faker.internet.email().toLowerCase(),
  password,
  role: ROLES.USER,
  emailVerified: true,
  status: USER_STATUSES.CONFIRMED,
};

const userThree = {
  _id: mongoose.Types.ObjectId(),
  firstName: capitalCase(faker.name.firstName()),
  lastName: capitalCase(faker.name.lastName()),
  email: faker.internet.email().toLowerCase(),
  password,
  role: ROLES.USER,
  emailVerified: false,
  status: USER_STATUSES.INVITATION_SENT,
};

const admin = {
  _id: mongoose.Types.ObjectId(),
  firstName: capitalCase(faker.name.firstName()),
  lastName: capitalCase(faker.name.lastName()),
  email: faker.internet.email().toLowerCase(),
  password,
  role: ROLES.ADMIN,
  emailVerified: false,
  status: USER_STATUSES.INVITATION_SENT,
};

const adminTwo = {
  _id: mongoose.Types.ObjectId(),
  firstName: capitalCase(faker.name.firstName()),
  lastName: capitalCase(faker.name.lastName()),
  email: faker.internet.email().toLowerCase(),
  password,
  role: ROLES.ADMIN,
  emailVerified: true,
  status: USER_STATUSES.CONFIRMED,
};

const insertUsers = async (users) => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};

module.exports = {
  userOne,
  userTwo,
  userThree,
  admin,
  adminTwo,
  insertUsers,
};
