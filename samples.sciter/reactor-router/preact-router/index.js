
import { exec, prepareVNodeForRanking, assign, pathRankSort } from './util';
//存放Router对象组件的数组
const ROUTERS = [];

const subscribers = [];

const EMPTY = {};

function getCurrentUrl() {
	let url = typeof location!=='undefined' ? location : EMPTY;
	//对于sciter来讲，location的意义不大，直接返回空也行
	url = EMPTY;
	return `${url.pathname || ''}${url.search || ''}`;
}

function route(url, replace=false) {
	if (typeof url!=='string' && url.url) {
		replace = url.replace;
		url = url.url;
	}
	
	return routeTo(url);
}

/** Tell all router instances to handle the given URL.  */
function routeTo(url) {
	let didRoute = false;
	// ROUTERS是存放Router组件的数组
	for (let i=0; i<ROUTERS.length; i++) {
		// 调用Router组件的routeTo方法，渲染页面
		if (ROUTERS[i].routeTo(url)===true) {
			didRoute = true;
		}
	}
	// 处理路由变化的全局回调函数
	for (let i=subscribers.length; i--; ) {
		subscribers[i](url);
	}
	return didRoute;
}

function routeFromLink(node) {
	// only valid elements
	if (!node || !node.getAttribute) return;
	
	let href = node.getAttribute('href'), target = node.getAttribute('target');
	// ignore links with targets and non-path URLs
	if (!href || !href.match(/^\//g) || (target && !target.match(/^_?self$/i))) return;

	// attempt to route, if no match simply cede control to browser
	return route(href);
}
//处理链接点击事件
function handleLinkClick(e) {
	// 鼠标左键点击
	if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.buttons!==0) return;
	routeFromLink(e.currentTarget || e.target || this);
	return prevent(e);
}
//阻止默认行为
function prevent(e) {
	if (e) {
		if (e.stopImmediatePropagation) e.stopImmediatePropagation();
		if (e.stopPropagation) e.stopPropagation();
		e.preventDefault();
	}
	return false;
}
//从children列表中找到可与url匹配的vnode,键名为url, 键值为path属性为url的vnode
function getMatchingChildren(children, url, invoke=true) {
	return children
		.filter(prepareVNodeForRanking)
		.sort(pathRankSort)
		.map( vnode => {
			//这里exec执行后，如果匹配返回匹配节点的props，否则返回false
			let matches = exec(url, vnode[1].path, vnode[1]);
			if (matches) {
				if (invoke !== false) {
					//复制一个新组件，将url和匹配节点的props都拷贝过去
					return Reactor.cloneOf(vnode, assign({url}, matches));
				}
				//对于不需要新组件的情况，直接返回原来的组件
				return vnode;
			}
			//如果没有匹配的，就不返回，在下一步过滤中会被过滤掉
		}).filter(Boolean); //移除所有的“false”类型元素(false, null, undefined, 0, NaN or an empty string)
}
//Router 组件
class Router extends Element {
	this(props, kids){
		this.url = props.url || getCurrentUrl();
		this.kids = kids;
		this.onChange = props.onChange;
	}
	// Re-render children with a new URL to match against
	routeTo(url) {
		this.componentUpdate{url};
		return true;
	}
    // 加载成功后，将当前路由对象加入ROUTERS
	componentDidMount() {
		ROUTERS.push(this);
	}
	// 当前router析构以后，将当前路由从对象ROUTERS中删除掉
	componentWillUnmount() {
		if (typeof this.unlisten==='function') this.unlisten();
		ROUTERS.splice(ROUTERS.indexOf(this), 1);
	}
	render() {
		// 根据当前state上的url，从children中找到能够匹配vnode
		let active = getMatchingChildren(this.kids, this.url);
		// 渲染优先级最高的那个vnode, 由于reactor不支持渲染null，只能给一个div
		let current = active[0];
		let previous = this.previousUrl;
		// 当路由发生变化时，触发props.onChange回调函数
		if (this.url!==previous) {
			this.previousUrl = this.url;
			if (typeof this.onChange==='function') {
				this.onChange({ router: this, url: this.url, previous, active, current });
			}
		}
		//外面包一个div，sciter目前不支持render返回null，对于非空对象也不能直接返回新组件，否则会面临父组件被析构
		return <div>{current}</div>;
	}
}
//Link 组件
const Link = (props, kids) =>{ 
	//组件参数解释: props 是一个object，存储了所有的参数，kids是一个数组，存储了所有的children
	//新创建一个vnode, type: [0]:'a' , props: [1]: += onClick, kids: [2]: kids 
	//简单说，就是建一个a链接，继承原有的path路径和链接名称，添加一个点击事件
	return JSX('a', assign({onClick: handleLinkClick}, props), kids);
};

export { Router, Link };
export default Router;

