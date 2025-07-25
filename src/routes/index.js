import * as controllers from '../controllers/index.js';

async function mainRoutes(fastify) {
    // Membership
    fastify.post('/registration', controllers.registerUser);
    fastify.post('/login', controllers.loginUser);
    fastify.get('/profile', { onRequest: [fastify.authenticate] }, controllers.getUserProfile);
    fastify.put('/profile/update', { onRequest: [fastify.authenticate] }, controllers.updateUserProfile);
    fastify.put('/profile/image', { onRequest: [fastify.authenticate] }, controllers.updateProfileImage);

    // Information
    fastify.get('/banner', controllers.getBanners);
    fastify.get('/services', { onRequest: [fastify.authenticate] }, controllers.getServices);

    // Transaction
    fastify.get('/balance', { onRequest: [fastify.authenticate] }, controllers.getBalance);
    fastify.post('/topup', { onRequest: [fastify.authenticate] }, controllers.topUp);
    fastify.post('/transaction', { onRequest: [fastify.authenticate] }, controllers.createTransaction);
    fastify.get('/transaction/history', { onRequest: [fastify.authenticate] }, controllers.getTransactionHistory);
}

export default mainRoutes;
