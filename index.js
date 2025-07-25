import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
import fastifyFormbody from '@fastify/formbody';

import { initializeDatabase } from './db.js';
import mainRoutes from './src/routes/index.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'a-very-strong-and-long-secret-key-for-jwt-that-is-at-least-32-chars';

const fastify = Fastify({
    logger: true,
});

fastify.register(fastifyJwt, { secret: JWT_SECRET });
fastify.register(fastifyMultipart);
fastify.register(fastifyFormbody);

fastify.decorate('authenticate', async function (request, reply) {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.status(401).send({
            status: 108,
            message: "Token tidak tidak valid atau kadaluwarsa",
            data: null
        });
    }
});

fastify.register(mainRoutes);
const start = async () => {
    try {

        const port = process.env.PORT || 3000
        await initializeDatabase();
        await fastify.listen({ port: port, host: '0.0.0.0' });
        fastify.log.info(`Server listening on ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
