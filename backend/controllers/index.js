const dbType = process.env.DB_TYPE || "mongodb";

export const getAuthController = async () => {
  return dbType === "mongodb"
    ? import("./mongodb/auth.controller.js")
    : import("./mysql/auth.controller.js");
};

export const getFormController = async () => {
  return dbType === "mongodb"
    ? import("./mongodb/form.controller.js")
    : import("./mysql/form.controller.js");
};

export const getResponseController = async () => {
  return dbType === "mongodb"
    ? import("./mongodb/response.controller.js")
    : import("./mysql/response.controller.js");
};

// Auth Wrappers
export const register = async (req, res, next) => {
  const c = await getAuthController();
  return c.register(req, res, next);
};

export const login = async (req, res, next) => {
  const c = await getAuthController();
  return c.login(req, res, next);
};

export const getUserProfile = async (req, res, next) => {
  const c = await getAuthController();
  return c.getUserProfile(req, res, next);
};

// Form Wrappers
export const getMyForms = async (req, res, next) => {
  const c = await getFormController();
  return c.getMyForms(req, res, next);
};

export const createForm = async (req, res, next) => {
  const c = await getFormController();
  return c.createForm(req, res, next);
};

export const getFormById = async (req, res, next) => {
  const c = await getFormController();
  return c.getFormById(req, res, next);
};

export const updateForm = async (req, res, next) => {
  const c = await getFormController();
  return c.updateForm(req, res, next);
};

export const deleteForm = async (req, res, next) => {
  const c = await getFormController();
  return c.deleteForm(req, res, next);
};

// Response Wrappers
export const submitResponse = async (req, res, next) => {
  const c = await getResponseController();
  return c.submitResponse(req, res, next);
};

export const getResponses = async (req, res, next) => {
  const c = await getResponseController();
  return c.getResponses(req, res, next);
};

export const getRespondentResponse = async (req, res, next) => {
  const c = await getResponseController();
  return c.getRespondentResponse(req, res, next);
};

export const updateRespondentResponse = async (req, res, next) => {
  const c = await getResponseController();
  return c.updateRespondentResponse(req, res, next);
};

export const deleteRespondentResponse = async (req, res, next) => {
  const c = await getResponseController();
  return c.deleteRespondentResponse(req, res, next);
};
