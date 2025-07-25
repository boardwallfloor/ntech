import * as businessLayer from '../domain/index.js';

const handleBusinessError = (reply, err) => {
    if (err.statusCode) {
        return reply.status(err.statusCode).send({ status: err.errorCode || err.statusCode, message: err.message, data: null });
    }
    console.error(err);
    reply.status(500).send({ message: 'Internal Server Error' });
};

//Membership
export const registerUser = async (request, reply) => {
    const { email, first_name, last_name, password } = request.body;
    try {
        await businessLayer.registerUser(email, first_name, last_name, password);
        reply.status(201).send({ status: 0, message: 'Registrasi berhasil silahkan login', data: null });
    } catch (err) { handleBusinessError(reply, err); }
};

export const loginUser = async (request, reply) => {
    const { email, password } = request.body;
    try {
        const token = await businessLayer.loginUser(email, password, request.server.jwt.sign);
        reply.send({ status: 0, message: 'Login Sukses', data: { token } });
    } catch (err) { handleBusinessError(reply, err); }
};

export const getUserProfile = async (request, reply) => {
    try {
        const user = await businessLayer.getUserProfile(request.user.email);
        const { hashed_password, ...userProfile } = user;
        reply.send({ status: 0, message: 'Sukses', data: userProfile });
    } catch (err) { handleBusinessError(reply, err); }
};

export const updateUserProfile = async (request, reply) => {
    const { first_name, last_name } = request.body;
    try {
        const updatedUser = await businessLayer.updateUserProfile(request.user.email, first_name, last_name);
        const { hashed_password, ...userProfile } = updatedUser;
        reply.send({ status: 0, message: 'Update Profile berhasil', data: userProfile });
    } catch (err) { handleBusinessError(reply, err); }
};

export const updateProfileImage = async (request, reply) => {
    try {
        const fileData = await request.file();
        const updatedUser = await businessLayer.updateProfileImage(request.user.email, fileData);
        const { hashed_password, ...userProfile } = updatedUser;
        reply.send({ status: 0, message: 'Update Profile Image berhasil', data: userProfile });
    } catch (err) { handleBusinessError(reply, err); }
};

//Information
export const getBanners = async (request, reply) => {
    const banners = await businessLayer.getBanners();
    reply.send({ status: 0, message: 'Sukses', data: banners });
};

export const getServices = async (request, reply) => {
    const services = await businessLayer.getServices();
    reply.send({ status: 0, message: 'Sukses', data: services });
};

//Transaction
export const getBalance = async (request, reply) => {
    const user = await businessLayer.getUserBalance(request.user.email);
    reply.send({ status: 0, message: 'Get Balance Berhasil', data: { balance: user.balance } });
};

export const topUp = async (request, reply) => {
    try {
        const result = await businessLayer.topUpBalance(request.user.email, request.body.top_up_amount);
        reply.send({ status: 0, message: 'Top Up Balance berhasil', data: result });
    } catch (err) { handleBusinessError(reply, err); }
};

export const createTransaction = async (request, reply) => {
    try {
        const result = await businessLayer.executePayment(request.user.email, request.body.service_code);
        reply.send({ status: 0, message: 'Transaksi berhasil', data: result });
    } catch (err) { handleBusinessError(reply, err); }
};

export const getTransactionHistory = async (request, reply) => {
    let { offset = 0, limit = null } = request.query;
    const records = await businessLayer.getTransactionHistory(request.user.email, limit, offset);
    reply.send({ status: 0, message: 'Get History Berhasil', data: { offset, limit: limit || records.length, records } });
};
