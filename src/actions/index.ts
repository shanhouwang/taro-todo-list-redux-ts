import * as Actions from '../constants/constants'

export const add = (text: string) => {
  return {
    type: Actions.ADD,
    text
  }
}

export const deleteByIndex = (index: number) => {
  return {
    type: Actions.DELETE_BY_INDEX,
    index
  }
}

export const onMouseOver = (index: number) => {
  return {
    type: Actions.ON_MOUSE_OVER,
    index
  }
}

export const clickTodosByIndex = (index: number) => {
  return {
    type: Actions.CLICK_TODOS_BY_INDEX,
    index
  }
}

export const clickAllCheckbox = () => {
  return {
    type: Actions.CLICK_ALL_CHECKBOX
  }
}

export const clearTodos = () => {
  return {
    type: Actions.CLEAR_TODOS
  }
}

export const onLongPressByIndex = (index: number) => {
  return {
    type: Actions.ON_LONG_PRESS_BY_INDEX,
    index
  }
}

export const editTodoByIndex = (text: string, index: number) => {
  return {
    type: Actions.EDIT_TODO_BY_INDEX,
    text,
    index
  }
}
