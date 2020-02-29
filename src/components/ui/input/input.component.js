// external libraries
import React, {useEffect, useRef, useReducer} from 'react'
import PropTypes from 'prop-types'
import ClassNames from 'classnames'
// local services & data store
import {validateText, useFocus, randomString, useDebounce} from "../../../services/utilities.service"
// local containers & components
import InputReadOnly from './input.read-only.component'
import InputDefault from './input.default.component'
// local constants & styles
import './input.style.scss'

/**
 * Declare component reducer
 * @param state
 * @param action
 * @returns {*}
 */
const inputReducer = (state, action) => {
  const {type, payload} = action
  switch (type) {
    case 'setError':
      return {...state, error: payload}
    case 'setLimitExceeded':
      return {...state, limitExceeded: payload}
    case 'setContentLength':
      return {...state, contentLength: payload}
    case 'clearAll':
      return {...state,
        error: false,
        limitExceeded: false,
        contentLength: 0
      }
    default:
      return state
  }
}

/**
 * Input main component
 * @param value - sets component visible value
 * @param onChange - returns value from user input
 * @param isDebounce - returns debounced value if true
 * @param defaultValue - used set value on component mount and reset
 * @param placeholder - placeholder on value absence
 * @param extraClassName
 * @param regExp - regExp for validate function, used to set error param
 * @param regExpStrict - prevents typing invalid characters into field
 * @param isDisabled - set readonly mode
 * @param reset - used to set default value
 * @param maxLength - used to count length left param, set error when exceeded
 * @param maxLengthStrict - prevents typing when limit exceeded
 * @param label - sets label for field
 * @param isClearable - displays clear button
 * @param errorText - used to display text on error
 * @param helperText - used to display helper text
 * @param isMultiline - used to replace input tah with textarea
 * @returns {*}
 * @constructor
 */
const Input = (
  { value,
    onChange,
    onChangeDebounced,
    defaultValue,
    placeholder,
    extraClassName,
    regExp,
    regExpStrict,
    isDisabled,
    reset,
    maxLength,
    maxLengthStrict,
    showCounter,
    label,
    isClearable,
    errorText,
    helperText,
    isMultiline,
  }) => {

  /**
   * Random uniq id
   * @type {string}
   */
  const randId = randomString()

  /**
   * Declare component initial state
   * @type {{textLength: *, error: boolean, limitExceeded: boolean}}
   */
  const initialState = {
    contentLength: defaultValue?.length ?? 0,
    error: false,
    limitExceeded: false,
  }

  /**
   * Declare state, dispatcher
   */
  const [state, dispatch] = useReducer(inputReducer, initialState)
  const {contentLength, error, limitExceeded} = state

  /**
   * Declare all reducer methods
   */
  const setError = payload => dispatch({type: 'setError', payload})
  const setLimitExceeded = payload => dispatch({type: 'setLimitExceeded', payload})
  const setContentLength = payload => dispatch({type: 'setContentLength', payload})
  const clearAll = () => dispatch({type: 'clearAll'})

  /**
   * Decide whether to set focus/blur handlers listeners
   */
  const [focus, {onBlur, onFocus}] = useFocus()

  /**
   * Resets default value on reset event or if any default value were provided
   */
  useEffect(() => {
    const validDefaultValue = typeof defaultValue === 'string'
    if (validDefaultValue && (defaultValue || reset)) {
      onChange(defaultValue)
      clearAll()
    }
  }, [defaultValue, reset, onChange])

  /**
   * Value validation function
   * @param e
   */
  const validation = e => {

    /**
     * Calculates available space left to type
     */
    const text = e?.target?.value
    if (!text) clearAll()

    /**
     * Check if limit is exceeded
     */
    const textLength = text?.length ?? 0
    const lengthLeft = maxLength - textLength
    const isLengthLeft = lengthLeft >= 0

    /**
     * Check if onChange func provided and length not exceeded on strict mode
     */
    if (onChange && maxLengthStrict ? isLengthLeft : true) {


      if (isLengthLeft) {
        setLimitExceeded(false)
      } else {
        setLimitExceeded(true)
      }

      if (regExp && regExpStrict) {
        /**
         * On strict mode will return only valid input and set error state
         * */
        if (validateText({regExp, text})){
          onChange(text)
          setContentLength(textLength)
        }
      } else if (regExp) {
        /**
         * On weak mode will return value
         * set error state
         * set content length
         */
        setContentLength(textLength)
        onChange(text)
        if (validateText({regExp, text})){
          setError(false)
        } else {
          setError(true)
        }
      } else {
        onChange(text)
      }
    }
  }

  const ref = useRef(null)

  const classNames = ClassNames({
    isClearable,
    focus,
    label,
    error,
    [`${extraClassName}`]: extraClassName,
    isMultiline,
    limitExceeded,
    isDisabled
  });

  const Tag = isMultiline ? 'textarea' : 'input'

  /**
   * Return debounced value of input
   * @type {any}
   */
  const debouncedValue = useDebounce(value, 500)

  useEffect(() => {
    if (debouncedValue) onChangeDebounced(debouncedValue)
  }, [debouncedValue, onChangeDebounced])

  return (
    <div
      className={`input ${classNames}`}
      onFocus={!isDisabled ? onFocus : undefined}
      onBlur={!isDisabled ? onBlur : undefined}
    >
      <label htmlFor={randId}>
        {label && <span className='input__label'>{label}</span>}
      </label>
      {isDisabled
       ? <InputReadOnly
          placeholder={placeholder}
          value={value}
          isDisabled={isDisabled}
          tag={Tag}
          inputId={randId}
        />
        : <InputDefault
            tag={Tag}
            placeholder={placeholder}
            value={value}
            validation={validation}
            error={error}
            errorText={errorText}
            helperText={helperText}
            contentLength={contentLength}
            maxLength={maxLength}
            showCounter={showCounter}
            onChange={onChange}
            clearAll={clearAll}
            ref={ref}
            inputId={randId}
        />
      }
    </div>
  )
}

Input.defaultProps = {
  value: '',
  onChange: ()=>{},
  onChangeDebounced: ()=>{},
  defaultValue: '',
  placeholder: '',
  extraClassName: '',
  regExp: null,
  regExpStrict: false,
  isDisabled: false,
  reset: false,
  maxLength: 200,
  maxLengthStrict: false,
  showCounter: false,
  label: '',
  isClearable: false,
  errorText: '',
  helperText: '',
  isMultiline: false,
}

Input.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onChangeDebounced: PropTypes.func,
  defaultValue: PropTypes.string,
  placeholder: PropTypes.string,
  extraClassName: PropTypes.string,
  regExp: PropTypes.instanceOf(RegExp),
  regExpStrict: PropTypes.bool,
  isDisabled: PropTypes.bool,
  reset: PropTypes.bool,
  maxLength: PropTypes.number,
  maxLengthStrict: PropTypes.bool,
  showCounter: PropTypes.bool,
  label: PropTypes.string,
  isClearable: PropTypes.bool,
  errorText: PropTypes.string,
  helperText: PropTypes.string,
  isMultiline: PropTypes.bool,
}

export default Input
