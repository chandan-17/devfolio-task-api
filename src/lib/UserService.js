const bcrypt = require('bcrypt');

class UserService {
  static getUser = async (email, { db }) => {
    const user = await db.select().from(`users`);
    if (!user.length) return { success: false, error: 'No such user' };

    return { success: true, body: user[0] };
  };

  static registerCustomer = async (args, context) => {
    const { name, email, password, phone, address = '' } = args;
    const { db, logger } = context;
    const getUserRes = await UserService.getUser(email, context);
    if (getUserRes.success) {
      return { success: false, error: `User already exists` };
    }

    const hash = await bcrypt.hash(password, 10);
    try {
      await db.transaction(async (trx) => {
        await trx('users').insert({
          name,
          email,
          phone,
          address,
          type: `CUSTOMER`,
        });
        return trx
          .insert({
            email,
            password: hash,
            type: `CUSTOMER`,
          })
          .into('auth');
      });
    } catch (error) {
      logger({ type: `error` }, `[TRX_Failed]`, error);
      return { success: false, error };
    }

    logger(`[REGISTER]`, email, `CUSTOMER`);
    return { success: true, body: `User ${email} successfully registered` };
  };
}

module.exports = UserService;
