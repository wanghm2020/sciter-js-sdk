import {Router, Link} from "preact-router/index";


//function Home(){return <div><h1>home</h1></div>;}
//function Messages(props){
//	return <div>user:{props.user} pass:{props.pass}</div>;
//}
//function SportsNews(){
//	return (
//		<div>
//			<h1>NBA NEWS</h1>
//			<ul>
//				<li>news1</li>
//				<li>news2</li>
//				<li>news3</li>
//			</ul>
//		</div>
//	);
//}
//function BreakingNews(){
//	return (
//		<div>
//			<h1>BREAKING NEWS</h1>
//			<ul>
//				<li>US news</li>
//				<li>UK news</li>
//				<li>JPN news</li>
//			</ul>
//		</div>
//	);
//}
//function News(props){
//	return (
//		<div>
//			<nav>
//				<Link href="/news/sports-news" >sports</Link>
//				<Link href="/news/breaking-news" >breaking</Link>
//			</nav>
//			<main>
//				<Router url={props.url}>
//					<SportsNews path="/news/sports-news"/>
//					<BreakingNews path="/news/breaking-news"/>
//				</Router>
//			</main>
//		</div>
//	);
//}
class Home extends Element {
    render() {
        return <div><h1>home</h1></div>;
    }
}
class Messages extends Element {
    render(props) {
        return <div>user:{props.user} pass:{props.pass}</div>;
    }
}
class SportsNews extends Element {
    render(props) {
        return (
			<div>
				<h1>NBA NEWS</h1>
				<ul>
					<li>news1</li>
					<li>news2</li>
					<li>news3</li>
				</ul>
			</div>
		);
    }
}

class BreakingNews extends Element {
    render(props) {
        return (
			<div>
				<h1>BREAKING NEWS</h1>
				<ul>
					<li>US news</li>
					<li>UK news</li>
					<li>JPN news</li>
				</ul>
			</div>
		);
    }
}

class News extends Element {
	this(props){
		this.url = props.url
	}
    render() {
        return (
			<div>
				<nav>
                  <Link href="/news/sports-news" >sports</Link>
					<Link href="/news/breaking-news" >breaking</Link>
              </nav>
              <main>
                  <Router url={this.url} onChange={this.onChange}>
                      <SportsNews path="/news/sports-news"/>
                      <BreakingNews path="/news/breaking-news"/>
                  </Router>
              </main>
			</div>
		);
    }
	onChange(props){
		console.log(props.url);
	}
}
class App extends Element {
	this(props){
		this.url = props.url
	}
    render() {
        return ( 
            <div>
                <nav>
                    <Link href="/" >home</Link>
                    <Link href="/messages/admin/12345">messages</Link>
                    <Link href="/news" >news</Link>
                </nav>
                <main>
                    <Router url={this.url} >
                        <Home path="/" />
                        <Messages path="/messages/:user/:pass"/>
                        <News path="/news/:*" />
                    </Router>
                </main>
            </div>
        );
    }
}

document.body.patch(<App/>);