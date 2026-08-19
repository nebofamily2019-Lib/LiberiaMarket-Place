'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create counties table
    await queryInterface.createTable('counties', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
      },
      capital: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      population: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      coordinates: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '{ lat: number, lng: number }'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    const addColSafe = async (table, col, def) => {
      const desc = await queryInterface.describeTable(table);
      if (!desc[col]) await queryInterface.addColumn(table, col, def);
    };
    const addIdxSafe = async (table, fields) => {
      try { await queryInterface.addIndex(table, fields); } catch (e) { if (!e.message.includes('already exists')) throw e; }
    };

    await addColSafe('users', 'county_id', {
      type: Sequelize.UUID, allowNull: true,
      references: { model: 'counties', key: 'id' },
      onUpdate: 'CASCADE', onDelete: 'SET NULL'
    });
    await addColSafe('products', 'county_id', {
      type: Sequelize.UUID, allowNull: true,
      references: { model: 'counties', key: 'id' },
      onUpdate: 'CASCADE', onDelete: 'SET NULL'
    });
    await addColSafe('products', 'specific_location', {
      type: Sequelize.STRING(200), allowNull: true
    });
    await addColSafe('products', 'coordinates', {
      type: Sequelize.JSON, allowNull: true
    });

    await addIdxSafe('users', ['county_id']);
    await addIdxSafe('products', ['county_id']);
    await addIdxSafe('products', ['location']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'coordinates');
    await queryInterface.removeColumn('products', 'specific_location');
    await queryInterface.removeColumn('products', 'county_id');
    await queryInterface.removeColumn('users', 'county_id');
    await queryInterface.dropTable('counties');
  }
};
