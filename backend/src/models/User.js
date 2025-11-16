const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Name is required' },
          notEmpty: { msg: 'Name cannot be empty' }
        }
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: { msg: 'Phone number is required' },
          notEmpty: { msg: 'Phone number cannot be empty' }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isEmail: { msg: 'Please provide a valid email' }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Password is required' },
          len: { args: [6, 128], msg: 'Password must be at least 6 characters' }
        }
      },
      role: {
        type: DataTypes.ENUM('buyer', 'seller', 'admin'),
        allowNull: false,
        defaultValue: 'buyer',
        comment: 'Primary role (kept for backwards compatibility)'
      },
      roles: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'buyer',
        comment: 'Comma-separated roles: buyer,seller,admin',
        get() {
          const value = this.getDataValue('roles');
          return value ? value.split(',') : [this.getDataValue('role')];
        },
        set(value) {
          if (Array.isArray(value)) {
            this.setDataValue('roles', value.join(','));
          } else {
            this.setDataValue('roles', value);
          }
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      isPhoneVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true
      },
      verificationTokenExpire: {
        type: DataTypes.DATE,
        allowNull: true
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
      },
      resetPasswordExpire: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      }
    });
  }

  getSignedJwtToken() {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  static associate(models) {
    User.hasMany(models.Product, {
      foreignKey: 'seller_id',
      as: 'products'
    });

    User.hasMany(models.Job, {
      foreignKey: 'userId',
      as: 'jobs'
    });

    User.hasMany(models.Notification, {
      foreignKey: 'userId',
      as: 'notifications'
    });

    User.hasMany(models.Message, {
      foreignKey: 'sender_id',
      as: 'sentMessages'
    });

    User.hasMany(models.Message, {
      foreignKey: 'receiver_id',
      as: 'receivedMessages'
    });
  }

  // Helper method to check if user has a specific role
  hasRole(role) {
    const userRoles = this.roles;
    return userRoles.includes(role) || userRoles.includes('admin');
  }

  // Helper method to add a role
  async addRole(role) {
    const currentRoles = this.roles;
    if (!currentRoles.includes(role)) {
      currentRoles.push(role);
      this.roles = currentRoles;
      await this.save();
    }
  }

  // Helper method to remove a role
  async removeRole(role) {
    const currentRoles = this.roles;
    const updatedRoles = currentRoles.filter(r => r !== role);
    this.roles = updatedRoles;
    await this.save();
  }
}

module.exports = User;