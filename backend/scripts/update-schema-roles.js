const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'libmarket.sqlite');
console.log('Database path:', dbPath);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log
});

async function updateSchema() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('Users');

    if (!tableInfo.gender) {
      console.log('Adding gender column...');
      await queryInterface.addColumn('Users', 'gender', {
        type: DataTypes.STRING,
        allowNull: true
      });
    } else {
        console.log('Gender column exists.');
    }

    if (!tableInfo.roles) {
      console.log('Adding roles column...');
      await queryInterface.addColumn('Users', 'roles', {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'buyer'
      });
    } else {
        console.log('Roles column exists.');
    }

    console.log('Schema update complete.');
  } catch (error) {
    console.error('Schema update failed:', error);
  }
}

updateSchema();
