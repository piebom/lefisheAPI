const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function findAll() {
  const allSessions = await prisma.session.findMany()
  return allSessions;
}

async function findSessionById(id) {
  const session = await prisma.session.findUnique({
    where: {
      sessionID: id
    }
  })
  return session;
}

async function createSession(data) {
  const session = await prisma.session.create({
    data: data
  })
  return session;
}

async function updateSession(id, data) {
  const session = await prisma.session.update({
    where: {
      sessionID: id
    },
    data: data
  })
  return session;
}

async function deleteSession(id) {
  const session = await prisma.session.delete({
    where: {
      sessionID: id
    }
  })
  return session;
}

module.exports = {
  findAll,
  findSessionById,
  createSession,
  updateSession,
  deleteSession
}