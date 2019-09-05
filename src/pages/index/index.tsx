import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text, Image, Checkbox, Input } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import * as actions from '../../actions/index'
import icon_close from '../../asset/icon_close.png'

import './index.scss'

// #region 书写注意
// 
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion
type PageStateProps = {
  todos: Todo[],
  isAllChecked: boolean,
  checkedCount: boolean
}

type PageDispatchProps = {
  add: (text: string) => void
  deleteByIndex: (index: number) => void
  onMouseOver: (index: number) => void
  clickTodosByIndex: (index: number) => void
  clickAllCheckbox: () => void
  clearTodos: () => void
  onLongPressByIndex: (index: number) => void
  editTodoByIndex: (text: string, index: number) => void
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps;
}

const isWx = process.env.TARO_ENV == 'weapp'

@connect(({ manageTodos }) => ({
  todos: manageTodos.todos,
  isAllChecked: manageTodos.isAllChecked,
  checkedCount: manageTodos.checkedCount
}), (dispatch) => ({
  add(input) {
    dispatch(actions.add(input))
  }, deleteByIndex(index) {
    dispatch(actions.deleteByIndex(index))
  }, onMouseOver(index) {
    dispatch(actions.onMouseOver(index))
  }, clickTodosByIndex(index) {
    dispatch(actions.clickTodosByIndex(index))
  }, clickAllCheckbox() {
    dispatch(actions.clickAllCheckbox())
  }, clearTodos() {
    dispatch(actions.clearTodos())
  }, onLongPressByIndex(index) {
    dispatch(actions.onLongPressByIndex(index))
  }, editTodoByIndex(text, index) {
    dispatch(actions.editTodoByIndex(text, index))
  }
}))
class Index extends Component {

  /**
 * 指定config的类型声明为: Taro.Config
 *
 * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
 * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
 * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
 */
  config: Config = {
    navigationBarTitleText: '首页'
  }

  state = {
    inputContent: ''
  }

  /**
   * 在 render 函数里面被谊染的子组件就会经历更新过程，不管父组件传给子组件的 props 有没有改变，都会触发子组件的 componentWillReceiveProps 函数
   */
  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount() { }

  /**
   * shouldComponentUpdate 函数返回布尔值 默认为true，若为false，则后续的render函数不讲执行 使用得当能提高React性能
   * 
   * true React 接下来就会依次调用对应组件的 componentWillUpdate、render 和 componentDidUpdate 函数
   */
  // shouldComponentUpdate() { }

  /**
   * render 函数被调用完之后，并非立即调用，是render函数返回的内容已经渲染到DOM树上，此时才触发此函数
   */
  componentDidMount() { }

  componentDidHide() { }

  saveNewTodo(e) {
    let { add } = this.props
    if (!e.detail.value) return
    add(e.detail.value)
    this.setState({
      inputContent: ''
    })
  }

  editTodo(e, index: number) {
    let { editTodoByIndex } = this.props
    if (!e.detail.value) return
    editTodoByIndex(e.detail.value, index)
  }

  onInputChange = (e) => {
    this.setState({
      inputContent: e.detail.value
    })
  }

  render() {
    console.log('>>>>>render<<<<<')
    let {
      todos
      , isAllChecked
      , checkedCount
      , deleteByIndex
      , onMouseOver
      , clickTodosByIndex
      , clearTodos
      , clickAllCheckbox
      , onLongPressByIndex } = this.props

    const todosJsx = todos.map((item, index) => {
      return (<View key={item.txt + index} className='index_list_item' onMouseOver={() => { onMouseOver(index) }}>
        <Checkbox
          value={item.txt}
          checked={item.checked}
          onClick={() => { clickTodosByIndex(index) }}
        />
        <Text
          className={item.checked ? 'index_list_item_txt_line' : 'index_list_item_txt'}
          onClick={() => { clickTodosByIndex(index) }}
          onLongClick={() => { onLongPressByIndex(index) }}
          onLongPress={() => { onLongPressByIndex(index) }}
          style={{ display: item.showInput ? 'none' : 'flex' }}
        >{item.txt}</Text>
        <Input
          type='text'
          value={item.txt}
          className='index_list_item_input'
          onConfirm={(e) => { this.editTodo(e, index) }}
          style={{ display: item.showInput ? 'flex' : 'none' }}
          onBlur={(e) => { this.editTodo(e, index) }}
        />
        <Image
          className='index_list_item_img_close'
          style={{ display: isWx ? 'flex' : item.showClose ? 'flex' : 'none' }}
          src={icon_close}
          onClick={() => { deleteByIndex(index) }}
        />
      </View>
      )
    })

    return (
      <View className='index'>
        <Text className='index_top'>TODOS</Text>
        <Input
          type='text'
          className='index_input'
          value={this.state.inputContent}
          placeholder='What needs to be done?'
          focus
          onInput={this.onInputChange}
          onConfirm={this.saveNewTodo.bind(this)}
        />
        <View className='index_tip'>
          <Checkbox
            value='all'
            checked={isAllChecked}
            onClick={clickAllCheckbox}
          />
          <Text onClick={clickAllCheckbox}>Mark all as complete</Text>
        </View>
        <View className='index_list' style={{ display: todos.length == 0 ? 'none' : 'flex' }} >
          {todosJsx}
        </View>
        <View className='index_bottom'>
          <Button onClick={clearTodos}>
            清除（{checkedCount}）个完成选项
          </Button>
        </View>
      </View>
    )
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion
export default Index as ComponentClass<PageOwnProps, PageState>
