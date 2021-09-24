const mongoose = require('mongoose');
const faker = require('faker');
const Workspace = require('../../src/models/workspace.model');

const workspaceOne = {
  _id: mongoose.Types.ObjectId(),
  name: faker.lorem.word(5),
};

const workspaceTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.lorem.word(5),
};

const workspaceThree = {
  _id: mongoose.Types.ObjectId(),
  name: faker.lorem.word(5),
};

const insertWorkspaces = async (workspaces) => {
  await Workspace.insertMany(workspaces);
};

module.exports = {
  workspaceOne,
  workspaceTwo,
  workspaceThree,
  insertWorkspaces,
};
