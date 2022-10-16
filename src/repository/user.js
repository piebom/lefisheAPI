    const { PrismaClient } = require('@prisma/client')

    const prisma = new PrismaClient()

async function findAll() {
  const allUsers = await prisma.user.findMany()
  return allUsers;
}

async function findUserById(id) {
  const user = await prisma.user.findUnique({
    where: {
      userID: id
    }
  })
  return user;
}

async function findUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  })
  return user;
}

async function createUser(data) {
  const user = await prisma.user.create({
    data: data
  })
  return user;
}

async function updateUser(id, data) {
  const user = await prisma.user.update({
    where: {
      userID: id
    },
    data: data
  })
  return user;
}

async function deleteUser(id) {
  const user = await prisma.user.delete({
    where: {
      userID: id
    }
  })
  return user;
}

module.exports = {
  findAll,
  findUserById,
  createUser,
  updateUser,
  deleteUser,
  findUserByEmail
}