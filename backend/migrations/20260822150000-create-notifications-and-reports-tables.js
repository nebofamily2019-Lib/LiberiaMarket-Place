'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('notifications')) {
      await queryInterface.createTable('notifications', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE'
        },
        type: {
          type: Sequelize.ENUM('offer', 'message', 'price_drop', 'system', 'order'),
          allowNull: false,
          defaultValue: 'system'
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        is_read: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        data: {
          type: Sequelize.JSON,
          allowNull: true
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });

      await queryInterface.addIndex('notifications', ['user_id']);
      await queryInterface.addIndex('notifications', ['is_read']);
      console.log('✅ notifications table created');
    } else {
      console.log('ℹ️ notifications table already exists, skipping');
    }

    if (!tables.includes('reports')) {
      await queryInterface.createTable('reports', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        reporter_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE'
        },
        reported_user_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onDelete: 'SET NULL'
        },
        product_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'products', key: 'id' },
          onDelete: 'SET NULL'
        },
        reason: {
          type: Sequelize.ENUM('scam', 'harassment', 'inappropriate_content', 'counterfeit', 'other'),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        status: {
          type: Sequelize.ENUM('pending', 'investigating', 'resolved', 'dismissed'),
          defaultValue: 'pending'
        },
        admin_notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });
      console.log('✅ reports table created');
    } else {
      console.log('ℹ️ reports table already exists, skipping');
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reports');
    await queryInterface.dropTable('notifications');
  }
};
