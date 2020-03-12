// external libraries
import { Map, Record } from 'immutable'
import { call, delay, put, takeLatest } from 'redux-saga/effects'
// local services & data store
import { fetchHotels } from '../../services/api.services'
// local containers & components
// local constants & styles

/**
 * Initial state
 * @type {Record.Factory<{error: boolean, loading: boolean}>}
 */
const InitialStateRecord = Record({
  error: false,
  loading: false,
  nextPortion: [],
  hotelsCollection: new Map([]),
  nextId: 0,
  finita: false,
  firstLoad: true,
})

/**
 * Declare used constants
 * @type {string}
 */
export const moduleName = 'hotels'
export const HOTELS_REQUEST = `${moduleName}/HOTELS_REQUEST`
export const HOTELS_REQUEST_ERROR = `${moduleName}/HOTELS_REQUEST_ERROR`
export const HOTELS_REQUEST_SUCCESS = `${moduleName}/HOTELS_REQUEST_SUCCESS`
export const HOTELS_REQUEST_EMPTY = `${moduleName}/HOTELS_REQUEST_EMPTY`

/**
 * Hotels reducer
 * @param state
 * @param action
 * @returns {(Record<{error: boolean, loading: boolean}> & Readonly<{error: boolean, loading: boolean}>)|any}
 */
export const hotelsReducer = (state = new InitialStateRecord(), action) => {
  const { type, payload, nextId } = action
  switch (type) {
    case HOTELS_REQUEST:
      return state.set('loading', true).set('error', false)
    case HOTELS_REQUEST_ERROR:
      return state.set('loading', false).set('error', payload)
    case HOTELS_REQUEST_SUCCESS:
      return state
        .set('loading', false)
        .set('nextId', nextId)
        .set('firstLoad', false)
        .updateIn(['hotelsCollection'], collection => [
          ...collection,
          ...payload,
        ])
    case HOTELS_REQUEST_EMPTY:
      return state.set('finita', true)
    default:
      return state
  }
}

/**
 * Returns required hotels range
 * @returns {any}
 */
export function* getHotelsSaga(action) {
  try {
    const { id, length, firstLoad } = action
    if (!firstLoad) yield delay(2500)
    const { data, nextIndex } = yield call(fetchHotels, { id, length })
    if (!data?.length) yield put({ type: HOTELS_REQUEST_EMPTY })
    yield put({
      type: HOTELS_REQUEST_SUCCESS,
      payload: data,
      nextId: nextIndex,
    })
  } catch (e) {
    yield put({ type: HOTELS_REQUEST_ERROR, payload: e })
  }
}

/**
 * Effect watcher
 * @returns {any}
 */
export default function* saga() {
  yield takeLatest(HOTELS_REQUEST, getHotelsSaga)
}
