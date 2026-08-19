
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // No-op: migration removed. Only 'users' table should exist.
    return Promise.resolve();
  },
  down: async (queryInterface, Sequelize) => {
    // No-op: migration removed. Only 'users' table should exist.
    return Promise.resolve();
  }
};
