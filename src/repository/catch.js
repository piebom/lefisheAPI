const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function findAll() {
    const allCatches = await prisma.Renamedcatch.findMany()
    return allCatches;
}

async function findCatchById(id) {
    const Renamedcatch = await prisma.Renamedcatch.findUnique({
        where: {
            catchID: id
        }
    })
    return Renamedcatch;
}

async function createCatch(data) {
    const Renamedcatch = await prisma.Renamedcatch.create({
        data: data
    })
    return Renamedcatch;
}

async function updateCatch(id, data) {
    const Renamedcatch = await prisma.Renamedcatch.update({
        where: {
            catchID: id
        },
        data: data
    })
    return Renamedcatch;
}

async function deleteCatch(id) {
    const Renamedcatch = await prisma.Renamedcatch.delete({
        where: {
            catchID: id
        }
    })
    return Renamedcatch;
}

module.exports = {
    findAll,
    findCatchById,
    createCatch,
    updateCatch,
    deleteCatch
}
