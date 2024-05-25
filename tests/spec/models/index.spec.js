const index = require('../../../src/database/models/index');
const Sequelize = require('sequelize');
// File created by sequelize, so I created this unit test only for practice.
describe('Index', () => {
  it('should import models correctly', () => {
    expect(index).toHaveProperty('User');
    expect(index).toHaveProperty('Task');
  });

  it('should set up Sequelize correctly', () => {
    expect(index.sequelize).toBeInstanceOf(Sequelize.Sequelize);
  });

  it('should establish associations between models if necessary', () => {
    expect(index.User).toHaveProperty('hasMany');
    expect(index.User.associations).toHaveProperty('Tasks');
  });
});