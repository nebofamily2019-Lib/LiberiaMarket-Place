const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = (sequelize) => {
  // Helper: normalize phone to 9-digit Liberian format (no leading zero, no country code)
  const normalizePhone = (phone) => {
    if (!phone) return phone
    const cleaned = String(phone).replace(/\D/g, '') // remove non-digits
    let digits = cleaned
    if (digits.startsWith('231')) digits = digits.slice(3) // remove country code
    if (digits.startsWith('0')) digits = digits.slice(1) // remove leading zero
    return digits
  }

  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name is required' },
        len: { args: [2, 50], msg: 'Name must be between 2 and 50 characters' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: {
        msg: 'Email already exists'
      },
      validate: {
        isEmail: { msg: 'Please provide a valid email' }
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Phone number already registered'
      },
      validate: {
        notEmpty: { msg: 'Phone number is required' },
        isLiberianPhone(value) {
          const val = normalizePhone(value)
          if (!/^\d{9}$/.test(val)) {
            throw new Error('Please provide a valid Liberian phone number (9 digits, e.g., 881234567)')
          }
          const validPrefixes = ['77','76','88','86','87','55','44','33','22']
          const prefix = val.substring(0,2)
          if (!validPrefixes.includes(prefix)) {
            throw new Error('Invalid network operator prefix for Liberian phone number')
          }
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
        len: { args: [6, 100], msg: 'Password must be at least 6 characters' }
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: { args: [0, 100], msg: 'Location must be less than 100 characters' }
      }
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('user', 'seller', 'admin'),
      defaultValue: 'user',
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    phoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    preferredPaymentMethods: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }, {
    hooks: {
      // Normalize phone before validation so validators receive canonical form
      beforeValidate: (user) => {
        if (user && user.phone) {
          user.phone = normalizePhone(user.phone)
        }
      },
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12)
          user.password = await bcrypt.hash(user.password, salt)
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed && user.changed('password')) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12)
          user.password = await bcrypt.hash(user.password, salt)
        }
      }
    }
  })

  // Instance methods
  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
  }

  User.prototype.getSignedJwtToken = function() {
    return jwt.sign(
      { id: this.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    )
  }

  User.prototype.getResetPasswordToken = function() {
    // Generate token
    const resetToken = require('crypto').randomBytes(20).toString('hex')

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = require('crypto')
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000 // 10 minutes

    return resetToken
  }

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get())
    delete values.password
    delete values.resetPasswordToken
    delete values.resetPasswordExpire
    delete values.emailVerificationToken
    return values
  }

  return User
}