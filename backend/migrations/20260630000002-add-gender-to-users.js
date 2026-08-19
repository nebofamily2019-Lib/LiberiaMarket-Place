'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('users');
    const addSafe = async (col, def) => {
      if (!desc[col]) {
        await queryInterface.addColumn('users', col, def);
        console.log(`✅ Added ${col} to users`);
      }
    };
    await addSafe('gender',      { type: Sequelize.STRING(10), allowNull: true });
    await addSafe('is_verified', { type: Sequelize.BOOLEAN, defaultValue: false });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'is_verified');
    await queryInterface.removeColumn('users', 'gender');
  }
};
