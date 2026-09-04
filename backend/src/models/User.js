const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User extends Model {
  static init(sequelize) {
      // Detect dialect for ENUM compatibility
      const isSqlite = sequelize.getDialect && sequelize.getDialect() === 'sqlite';
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
          unique: {
            msg: 'Phone number already registered'
          },
          validate: {
            notNull: { msg: 'Phone number is required' },
            notEmpty: { msg: 'Phone number cannot be empty' },
            isLiberiaMobile(value) {
              // Accept 8 or 9 digits (local) or +231 followed by 8 or 9 digits (international)
              const localPattern = /^\d{8,9}$/;
              const intlPattern = /^\+231\d{8,9}$/;
              if (!localPattern.test(value) && !intlPattern.test(value)) {
                throw new Error('Phone number must be 8-9 digits (local) or +231 followed by 8-9 digits (Liberia mobile)');
              }
            }
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
        gender: {
          type: DataTypes.ENUM('Male', 'Female'),
          allowNull: true, // Optional for now to avoid breaking existing users
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
          type: isSqlite ? DataTypes.STRING : DataTypes.ENUM('buyer', 'seller', 'admin'),
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
        resetPasswordToken: {
          type: DataTypes.STRING,
          allowNull: true
        },
        resetPasswordExpire: {
          type: DataTypes.DATE,
          allowNull: true
        },
        county_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'counties',
            key: 'id'
          }
        },
        sms_notifications_enabled: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        sms_preferences: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: {
            new_message: true,
            offer_received: true,
            offer_accepted: true,
            payment_request: true,
            price_drop: false
          }
        },
        avg_rating: {
          type: DataTypes.DECIMAL(3, 2),
          allowNull: true,
          defaultValue: null
        },
        total_reviews: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        },
        total_sales: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        },
        trust_score: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Computed reputation score used for search ranking (rating + completed deals)'
        },
        response_rate: {
          type: DataTypes.INTEGER,
          defaultValue: null,
          comment: 'Percentage 0-100'
        },
        avg_response_time: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: 'Average response time in minutes'
        },
        is_verified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        },
        token_version: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          allowNull: false
        }
      }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        underscored: true,
        paranoid: true,
        indexes: [],
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
    return jwt.sign({ id: this.id, v: this.token_version }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  static associate(models) {
    // Product relationship
    this.hasMany(models.Product, {
      foreignKey: 'seller_id',
      as: 'products'
    });

    // County relationship
    this.belongsTo(models.County, {
      foreignKey: 'county_id',
      as: 'county'
    });

    // Mobile Money Accounts
    this.hasMany(models.MobileMoneyAccount, {
      foreignKey: 'user_id',
      as: 'mobileMoneyAccounts'
    });

    // Payments as payer
    this.hasMany(models.Payment, {
      foreignKey: 'payer_id',
      as: 'paymentsMade'
    });

    // Payments as payee
    this.hasMany(models.Payment, {
      foreignKey: 'payee_id',
      as: 'paymentsReceived'
    });

    // SMS Logs
    this.hasMany(models.SmsLog, {
      foreignKey: 'user_id',
      as: 'smsLogs'
    });

    // Reviews as reviewer
    this.hasMany(models.Review, {
      foreignKey: 'reviewer_id',
      as: 'reviewsGiven'
    });

    // Reviews as reviewee
    this.hasMany(models.Review, {
      foreignKey: 'reviewee_id',
      as: 'reviewsReceived'
    });

    // Saved Items
    this.hasMany(models.SavedItem, {
      foreignKey: 'user_id',
      as: 'savedItems'
    });

    // Sent Offers (as Buyer)
    this.hasMany(models.Offer, {
      foreignKey: 'buyer_id',
      as: 'sentOffers'
    });

    // Received Offers (as Seller)
    this.hasMany(models.Offer, {
      foreignKey: 'seller_id',
      as: 'receivedOffers'
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