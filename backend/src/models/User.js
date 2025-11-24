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
      },
      loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lockUntil: {
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
    // ONLY Product relationship - remove ALL other associations
    this.hasMany(models.Product, {
      foreignKey: 'seller_id',
      as: 'products'
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

  // Method to check if account is locked
  isLocked() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  }

  // Method to increment login attempts
  async incLoginAttempts() {
    // If lock has expired, reset attempts
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.update({
        loginAttempts: 1,
        lockUntil: null
      });
    }

    // Otherwise increment attempts
    const updates = { loginAttempts: this.loginAttempts + 1 };

    // Lock account after 5 failed attempts
    if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
      updates.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
      console.warn(`🔒 Account locked: ${this.phone} after 5 failed attempts`);
    }

    return this.update(updates);
  }

  // Method to reset login attempts
  async resetLoginAttempts() {
    return this.update({
      loginAttempts: 0,
      lockUntil: null
    });
  }
}

module.exports = User;