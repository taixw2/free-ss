// @https://github.com/MRdNk/jsonValidator

const BASE_SCHEMA = {
  maxLength: {
    type: Number,
  },
  minLength: {
    type: Number,
  },
  type: {
    type: '*',  // * == [ Number, String, RegExp, Boolean, Object, Array, Function, null, undefined ]
    require: true,
  },
  require: {
    type: [Number, Boolean],
  }  
}

const isArray = (param) => {

  if (Array.isArray) {
    return Array.isArray(param)
  }

  return ({}).toString.call(param) === '[object Array]'
  
}

export default class ValidatorJSON{
  constructor (scheam, json) {
    this.scheam = scheam
    this.json = json
  }

  setScheam(scheam) {
    this.scheam = scheam
  }

  setJSON(json) {
    this.json = json
  }

  validator() {
    return new Promise((resolve, reject) => {
      if (!this.scheam || !this.validatorScheam()) {
        reject('not match scheam')
        return
      }
      if (!this.json || !this.validatorJSON()) {
        reject('not match json')
        return
      }
      resolve(true)
    })    
  }

  checkType(value, type) {
    
    if (isArray(type)) {
      for(let _type of type) {
        if (this.checkType(value, _type)){
          return false
        }
      }
      return true
    }

    return value === type || value instanceof type
    
  }

  _validator(validatorData, vaildatorScheam) {
    for (let key in validatorData) {
      let value = validatorData[key]
      let scheam = vaildatorScheam[key]
      
      if (scheam.require && value === undefined) {
        return false
      }

      if (!this.checkType(value, scheam.type)) {
        return false
      }

      if (typeof value === 'string' || isArray(value)) {
        if (scheam.maxLength && value.length > scheam.maxLength) return false
        if (scheam.minLength && value.length < scheam.minLength) return false
      }
      
      if (typeof value === 'number') {
        if (scheam.maxLength && value > scheam.maxLength) return false
        if (scheam.minLength && value < scheam.minLength) return false
      }
    }

    return true

  }

  validatorScheam() {

    let result = true

    for (let key in this.scheam) {
      if (typeof this.scheam[key] !== 'object') {
        result = this._validator(this.scheam[key], BASE_SCHEMA)
      } else {
        result = this._validator({ 
          [key]: this.scheam[key],
        }, BASE_SCHEMA)
      }

      if (!result) {
        return false
      }
    }

    return true
    
  }

  validatorJSON() {
    return this._validator(this.json, this.scheam)
  }

}
