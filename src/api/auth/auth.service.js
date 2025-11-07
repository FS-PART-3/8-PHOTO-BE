//auth service고 auth에서만 사용하긴 하지만,
//user 테이블에 관한 내용 밖에 없네요..

import repo from "./auth.repository.js";
import {
  hashPassword,
  password,
  verifyPassword,
} from "../../auth/utils/hash.js";

export async function createUser(user) {
  try {
    const existedUser = await repo.findByEmail(user.email);
    if (existedUser) {
      const error = new Error("이미 사용 중인 이메일입니다.");
      error.code = 409;
      error.data = { email: user.email };
      throw error;
    } //중복되는 이메일이 있으면 에러(이미 존재하는 유저)

    const hashedPassword = await hashPassword(user.password); //해시화
    const createdUser = await repo.save({
      ...user,
      password: hashedPassword,
    });
    return filterSensitiveUserData(createdUser);
  } catch (error) {
    if (error.code === 400) throw error; // 기존의 중복 체크 에러는 그대로 전달
    if (error.code === 409) throw error; // 기존의 중복 체크 에러는 그대로 전달

    // Prisma 에러를 애플리케이션에 맞는 형식으로 변환
    const customError = new Error("데이터베이스 작업 중 오류가 발생했습니다");
    customError.code = 500;
    throw customError;
  }
}

export async function getUser(email, password) {
  try {
    const user = await repo.findByEmail(email);
    if (!user) {
      const error = new Error("존재하지 않는 이메일입니다.");
      error.code = 401;
      throw error;
    }
    await verifyPassword(password, user.password);
    return filterSensitiveUserData(user);
  } catch (error) {
    if (error.code === 401) throw error;
    const customError = new Error("데이터베이스 작업 중 오류가 발생했습니다");
    customError.code = 500;
    throw customError;
  }
}

export async function getUserById(id) {
  try {
    const user = await repo.findById(id);
    if (!user) {
      const error = new Error("존재하지 않는 유저입니다.");
      error.code = 401;
      throw error;
    }

    return filterSensitiveUserData(user);
  } catch (error) {
    if (error.code === 401) throw error;
    const customError = new Error("데이터베이스 작업 중 오류가 발생했습니다");
    customError.code = 500;
    throw customError;
  }
}

export async function checkPassword(userId, password) {
  try {
    const user = await repo.findById(userId);
    if (!user) {
      const error = new Error("존재하지 않는 유저입니다.");
      error.code = 401;
      throw error;
    }
    await verifyPassword(password, user.password);
    return filterSensitiveUserData(user);
  } catch (error) {
    if (error.code === 401) throw error;
    const customError = new Error("데이터베이스 작업 중 오류가 발생했습니다");
    customError.code = 500;
    throw customError;
  }
}

export async function updateUser(userId, data) {
  //만약 비밀번호가 들어오면 해시화
  let _data = data;
  if (data?.password) {
    const hashedPassword = await hashPassword(data.password);
    _data = {
      ...data,
      password: hashedPassword,
    };
  }
  const user = repo.update(userId, _data);
  return filterSensitiveUserData(user);
}

export async function oauthCreateOrUpdate(provider, providerId, email, name) {
  const user = await repo.createOrUpdate(provider, providerId, email, name);
  return filterSensitiveUserData(user);
}

function filterSensitiveUserData(user) {
  const { id, email, name, createdAt, provider } = user;
  return { id, email, name, provider, createdAt };
}
