import { combineReducers } from 'redux'
import * as Actions from '../constants/constants'

/**
 * 初始化数据
 */
const local: Todo[] = getTodosFromLocal()

const INITIAL_STATE = {
  todos: local,
  isAllChecked: setAllChecked(local),
  checkedCount: setCheckedCount(local)
}

const isWx = process.env.TARO_ENV === 'weapp'

function getTodosFromLocal(): Todo[] {
  let data = []
  if (isWx) {
    let wxData = wx.getStorageSync('todos')
    // 这个判断很重要
    data = wxData === null || wxData === undefined || wxData === '' ? [] : wxData
  } else {
    let dataNotWx = localStorage.getItem('todos')
    data = dataNotWx === null || dataNotWx === '' ? [] : JSON.parse(dataNotWx)
  }
  return data
}

/**
 * 设置是否全选
 */
function setAllChecked(data: Todo[]) {
  if (data === null || data === undefined) {
    return false
  }
  console.log(data)
  let allChecked = data.every((everyItem) => {
    return everyItem === null ? false : everyItem.checked
  })
  return data.length === 0 ? false : allChecked
}

/**
 * 底部选择数量更新
 */
function setCheckedCount(data: Todo[]) {
  return data.filter((item) => { return item.checked }).length
}

/**
 * 保存数据到浏览器/手机内存
 */
function saveDataToLocal(saveData: Todo[]) {
  if (isWx) {
    wx.setStorage({
      key: 'todos',
      data: saveData,
      success: (res) => {
        console.log('saveDataToLocal success')
      }
    })
  } else {
    localStorage.setItem('todos', JSON.stringify(saveData))
  }
}

function manageTodos(state = INITIAL_STATE, action) {
  console.log(action)
  switch (action.type) {
    case Actions.ADD:
      let info: Todo = { txt: action.text, checked: false, showClose: false, showInput: false }
      let todos = state.todos.concat(info)
      saveDataToLocal(todos)
      return {
        ...state,
        todos: todos,
        isAllChecked: false
      }
    case Actions.DELETE_BY_INDEX:
      // splice 并不会引发重新render
      // state.todos.splice(action.index, 1);
      let dataByDelete: Todo[] = []
      state.todos.map((item, index) => {
        if (action.index !== index) {
          dataByDelete.push(item)
        }
      })
      saveDataToLocal(dataByDelete)
      return {
        ...state,
        todos: dataByDelete,
        isAllChecked: setAllChecked(dataByDelete),
        checkedCount: setCheckedCount(dataByDelete)
      }
    case Actions.ON_MOUSE_OVER:
      let todosOfMouseOver: Todo[] = []
      state.todos.map((item, index) => {
        if (action.index == index) {
          item.showClose = true
        } else {
          item.showClose = false
        }
        todosOfMouseOver.push(item)
      })
      return {
        ...state,
        todos: todosOfMouseOver
      }
    case Actions.CLICK_TODOS_BY_INDEX:
      let newTodos: Todo[] = []
      state.todos.map((item, index) => {
        if (action.index == index) {
          item.checked = !item.checked
        }
        newTodos.push(item)
      })
      saveDataToLocal(newTodos)
      return {
        ...state,
        todos: newTodos,
        isAllChecked: setAllChecked(newTodos),
        checkedCount: setCheckedCount(newTodos)
      }
    case Actions.CLICK_ALL_CHECKBOX:
      let checked = !state.isAllChecked
      let dataOfAll: Todo[] = [...state.todos]
      for (let i = 0; i < dataOfAll.length; i++) {
        dataOfAll[i].checked = checked
      }
      saveDataToLocal(dataOfAll)
      return {
        ...state,
        todos: dataOfAll,
        isAllChecked: checked,
        checkedCount: checked ? dataOfAll.length : 0
      }
    case Actions.CLEAR_TODOS:
      let data: Todo[] = []
      for (let i = 0; i < state.todos.length; i++) {
        if (!state.todos[i].checked) {
          data.push(state.todos[i])
        }
      }
      saveDataToLocal(data)
      return {
        ...state,
        todos: data,
        isAllChecked: false,
        checked: 0
      }
    case Actions.ON_LONG_PRESS_BY_INDEX:
      // https://github.com/NervJS/taro/issues/2967
      let dataOfLongPress: Todo[] = JSON.parse(JSON.stringify(state.todos))
      dataOfLongPress.map((item, index) => {
        if (index == action.index) {
          item.showInput = !item.showInput
        }
      })
      saveDataToLocal(dataOfLongPress)
      return {
        ...state,
        todos: dataOfLongPress
      }
    case Actions.EDIT_TODO_BY_INDEX:
      let dataOfEdit: Todo[] = JSON.parse(JSON.stringify(state.todos))
      dataOfEdit.map((item, index) => {
        if (index == action.index) {
          item.txt = action.text
          item.showInput = false
        }
      })
      saveDataToLocal(dataOfEdit)
      return {
        ...state,
        todos: dataOfEdit
      }
    default:
      return state
  }
}

export default combineReducers({
  manageTodos
})
