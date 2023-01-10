let times = 0
export const getUniqId = (type?: string) => {
  times += 1
  if (type) {
    return `${type}${Date.now().toString(36)}${times}`
  }
  return `${Date.now().toString(36)}${times}`
}
