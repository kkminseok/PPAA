export const state = () => ({
    maxPrice: null
  })
  
export const mutations = {
    setMaxPrice(state, user) {
        state.maxPrice = user;
    }
}
  
  