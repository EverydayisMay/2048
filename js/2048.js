function setCookie(cname,val,days){
	console.log('1');
	var target=new Date(
			new Date().getTime()+(1000*3600*24*days)
		);
	document.cookie=
		cname+"="+val+";expires="
			+target.toGMTString();
}
function getCookie(cname){
	var str=document.cookie;
	var substrs=str.split("; ");
	//遍历substrs中每个字符串，同时创建空对象cookies={}
	for(var i=0,cookies={};
			i<substrs.length;
			i++){
		//将substrs中当前字符串按=切割到arr
		var arr=substrs[i].split("=");
		//在cookies中添加新属性,名为arr[0],值为arr[1]
		cookies[arr[0]]=arr[1];
	}//(遍历结束)
	return cookies[cname];
}
var game={
	data:null,//保存RN行CN列的二维数组
	data_copy:[],//深度复制data数组
	prev_datas:[],//保存之前几次移动前的data，用来回退操作
	RN:4,
	CN:4,
	// 如何计算score 每次合并相同值的时候，score加上合并后的值为得分
	score:0,
	prev_score:[],//保存之前几次移动前的score，用于回退操作
	GOBACKTIMES:6,//设置回退操作的次数
	topScore:0,//保存最高分
	state:1,
	GAMEOVER:0,
	RUNNING:1,
	// 强调
	// 1. 每个属性和方法结尾都要用','分割
	// 2. 方法中使用自己的属性都必须前加"this."
	start:function(){
		this.state=this.RUNNING;//重置游戏状态为running
		this.topScore=getCookie("topScore")||0;
		this.score=0;// 将score重置为0
		// 初始化RN*CN的二维数组
		// 创建二维空数组
		this.data=new Array();
		for(var r=0;r<this.RN;r++){
			for(var c=0,arr=[];c<this.CN;c++){
				arr[c]=0;
			}
			this.data[r]=arr;
		}
		// debugger;
		this.randomNum();this.randomNum();
		this.updateView();
		// console.log(this.data.join("\n"));
		document.onkeydown=function(e){
			// alert(e.keyCode);
			// 判断e.keyCode
				// 37：左移；38：上移；39：右移；40：下移
			if(this.state){
				switch(e.keyCode){
					case 37:
						this.data_deep_copy();
						// 用于回退操作
						this.prev_datas_save();
						this.moveLeft();
						if(this.isDataArrChange())
							this.randomNum_generate();
						this.updateView();
						// 判断游戏是否结束
						if(this.isGameOver()){
							this.state=this.GAMEOVER;
							this.updateView();
						}
						// console.log(this.data.join("\n"));
						break;
					case 38:
						this.data_deep_copy();
						this.prev_datas_save();
						this.moveTop();
						if(this.isDataArrChange())
							this.randomNum_generate();
						this.updateView();
						// 判断游戏是否结束
						if(this.isGameOver()){
							this.state=this.GAMEOVER;
							this.updateView();
						}
						// console.log(this.data.join("\n"));
						break;
					case 39:
						this.data_deep_copy();
						this.prev_datas_save();
						this.moveRight();
						if(this.isDataArrChange())
							this.randomNum_generate();
						this.updateView();
						// 判断游戏是否结束
						if(this.isGameOver()){
							this.state=this.GAMEOVER;
							this.updateView();
						}
						// console.log(this.data.join("\n"));
						break;
					case 40:
						this.data_deep_copy();
						this.prev_datas_save();
						this.moveDown();
						if(this.isDataArrChange())
							this.randomNum_generate();
						this.updateView();
						// 判断游戏是否结束
						if(this.isGameOver()){
							this.state=this.GAMEOVER;
							this.updateView();
						}
						// console.log(this.data.join("\n"));
						break;
				}		
			}
		}.bind(this);
	},
	isGameOver:function(){
		// debugger;
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				if(this.data[r][c]==0)
					return false;
				else if(c<this.CN-1&&this.data[r][c]==this.data[r][c+1]){
					return false;
				}else if(r<this.RN-1&&this.data[r][c]==this.data[r+1][c]){
					return false;
				}
			}
		}
		return true;
	},
	// isMultiArr:function(arr){
	// 	for(var i=0,len=arr.length;i<len;i++){
	// 		if(arr[i] instanceof Array) return true;
	// 	}
	// 	return false;
	// },
	data_deep_copy:function(){
		for(var r=0;r<this.RN;r++){
			this.data_copy[r]=this.data[r].slice(0);
		}
	},
	data_deep_copy2:function(arr){
		// 仅仅对二维数组深拷贝有用
		// 维数再高点就不适用了
		var isTwoArr=false;
		var temp=[];
		for(var i=0;i<arr.length;i++){
			if(arr[i] instanceof Array){
				temp[i]=arr[i].slice(0);	
			}else{
				temp[i]=arr[i];
			}
		}
		return temp;	
	},
	prev_datas_save:function(){
		//this.data的值变化则this.prev_datas里的值也会变
		// 如此赋值不能达到效果
		if(this.prev_datas.length<this.GOBACKTIMES){
			this.prev_datas.unshift(this.data_deep_copy2(this.data));
			this.prev_score.unshift(this.score);
		}else{
			this.prev_datas.unshift(this.data_deep_copy2(this.data));
			this.prev_datas.pop();
			this.prev_score.unshift(this.score);
			this.prev_score.pop();
		}
	},
	go_prev_step:function(){
		// debugger;
		if(this.prev_datas.length>0){
			this.data=this.data_deep_copy2(this.prev_datas.shift());
			this.score=this.prev_score.shift();
			this.updateView();	
		}else{
			alert('暂时无法后退了');
		}
	},
	isDataArrChange:function(){
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				if(this.data_copy[r][c]!=this.data[r][c])
					return true;
			}
		}
		return false;
	},
	randomNum:function(){
		//反复 
		  // 在一个随机位置生成2或4
		  // 生成随机位置p[rnd_r,rnd_c]
		  // 设置p的值，随机小数n<0.5?2:4;
		  while(true){
		  	 var rnd_r = Math.floor(Math.random()*this.RN);
		  	 var rnd_c = Math.floor(Math.random()*this.CN);
		  	 if(this.data[rnd_r][rnd_c]===0){
		  	 	 this.data[rnd_r][rnd_c]=(Math.random()<0.5?2:4);
		  	 	 break;
		  	 }
		  }	
	},
	randomNum_generate:function(){
		var zeroCount=0;
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				if(this.data[r][c]==0)
					zeroCount++;
			}
		}
		if(zeroCount>=1){
			this.randomNum();
		}else{
			return;
		}
	},
	updateView:function(){
		// 将data中的每个元素值更新到页面对应的div上
		// 遍历data
			// 找到和r行c列对应的div
			// 设置其内容为data中对应元素值(值为0则不显示)
			// 设置class为"cell n"+当前元素的值
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				var cell = document.getElementById('c'+r+c);
				if(this.data[r][c]!==0){
					 cell.innerHTML=this.data[r][c];
					 cell.className="cell n"+this.data[r][c];
				}else{
					cell.innerHTML="";
					cell.className="cell";
				}
			}
		}
		// 将score的值放入id为score的标签中
		document.getElementById("score").innerHTML=this.score;
		//将topScore属性的值，放入id为topScore的div中
		document.getElementById("topScore")
			      .innerHTML=this.topScore;
		//设置id为gameOver的display为:
		    //如果游戏结束 就显示 否则隐藏
		document.getElementById("gameOver").style.display=this.state==this.GAMEOVER?"block":"none";	
		//如果游戏结束,就设置id为final的span的内容为score属性
		if(this.state===this.GAMEOVER){
			document.getElementById("final")
			        .innerHTML=this.score;
			//如果this.score>this.topScore
			if(this.score>this.topScore){
				//将score保存到cookie中
				setCookie("topScore",this.score,365);
			}
		}
	},
	// 数组判断是否每个元素都为0
	arr_isNull:function(arr){
		for(var i=0;i<arr.length;i++){
			if(arr[i]!=0){
				return false;
			}
		}
		return true;
	},
	// 数组非0数字前移
	arr_zero_backward:function(arr){
		for(var i=0;i<arr.length;i++){
			if(this.arr_isNull(arr.slice(i+1))){
				break;
			}
			while(arr[i]==0){
				if(this.arr_isNull(arr.slice(i+1))){
					break;
				}
				for(var j=i+1;j<arr.length;j++){
					arr[j-1]=arr[j];
					arr[j]=0;
				}
				// debugger;	
			}
			// console.log(arr[i]);
		}
		return arr;
	},
	// 倒转数组
	arrFrontToEnd:function(arr){
		var temp=[];
		for(var i=0;i<arr.length;i++){
			temp[i]=arr[arr.length-1-i];
		}
		// debugger;
		return temp;
	},
	moveLeftInRowTest:function(data_row){
		// debugger;
		for(var curr=0;curr<this.CN;curr++){
			if(data_row[curr]==0){
				data_row=this.arr_zero_backward(data_row);
			}
			for(var next=curr+1;next<this.CN;next++){
				if(data_row[next]==data_row[curr]){
					data_row[next]=0;
					data_row[curr]*=2;
					this.score+=data_row[curr];
					break;
				}else{
					break;
				}
			}
		}
		console.log(data_row);
	},
	moveLeft:function(){
		for(var r=0;r<this.RN;r++){
			if(!this.arr_isNull(this.data[r])){
				this.moveLeftInRow(r);
			}	
		}
	},
	moveLeftInRow:function(r){
		var data_row=this.arr_zero_backward(this.data[r]);
		for(var curr=0;curr<this.CN;curr++){
			if(data_row[curr]==0){
				data_row=this.arr_zero_backward(data_row);
			}
			for(var next=curr+1;next<this.CN;next++){
				if(data_row[next]==data_row[curr]){
					data_row[next]=0;
					data_row[curr]*=2;
					this.score+=data_row[curr];
					break;
				}else{
					break;
				}
			}
		}
		this.data[r]=data_row;
	},
	moveRight:function(){
		for(var r=0;r<this.RN;r++){
			if(!this.arr_isNull(this.data[r])){
				this.moveRightInRow(r);
			}	
		}
	},
	moveRightInRow:function(r){
		// 先倒转数组
		var data_row=this.arrFrontToEnd(this.data[r]);
		data_row=this.arr_zero_backward(data_row);
		for(var curr=0;curr<this.CN;curr++){
			if(data_row[curr]==0){
				data_row=this.arr_zero_backward(data_row);
			}
			for(var next=curr+1;next<this.CN;next++){
				if(data_row[next]==data_row[curr]){
					data_row[next]=0;
					data_row[curr]*=2;
					this.score+=data_row[curr];
					break;
				}else{
					break;
				}
			}
		}
		// 最后将数组倒转回来
		data_row=this.arrFrontToEnd(data_row);
		this.data[r]=data_row;
	},
	// 将一列的数字提取成一个数组
	arr_verti_comb:function(c){
		var temp=[];
		for(var r=0;r<this.RN;r++){
			temp[r]=this.data[r][c];
		}
		return temp;
	},
	// 将数组赋值到二维数组data对应的列上
	arr_verti_input:function(arr,c){
		for(var r=0;r<this.RN;r++){
			this.data[r][c]=arr[r];
		}
	},
	moveTop:function(){
		for(var c=0;c<this.CN;c++){
			var arr_verti=this.arr_verti_comb(c);
			if(!this.arr_isNull(arr_verti)){
				this.moveTopInRow(arr_verti,c);
			}	
		}
	},
	moveTopInRow:function(arr_verti,c){
		var data_row=this.arr_zero_backward(arr_verti);
		for(var curr=0;curr<this.CN;curr++){
			if(data_row[curr]==0){
				data_row=this.arr_zero_backward(data_row);
			}
			for(var next=curr+1;next<this.CN;next++){
				if(data_row[next]==data_row[curr]){
					data_row[next]=0;
					data_row[curr]*=2;
					this.score+=data_row[curr];
					break;
				}else{
					break;
				}
			}
		}
		this.arr_verti_input(data_row,c);
	},
	moveDown:function(){
		for(var c=0;c<this.CN;c++){
			var arr_verti=this.arr_verti_comb(c);
			if(!this.arr_isNull(arr_verti)){
				this.moveDownInRow(arr_verti,c);
			}	
		}
	},
	moveDownInRow:function(arr_verti,c){
		// 先倒转数组
		var data_row=this.arrFrontToEnd(arr_verti);
		data_row=this.arr_zero_backward(data_row);
		for(var curr=0;curr<this.CN;curr++){
			if(data_row[curr]==0){
				data_row=this.arr_zero_backward(data_row);
			}
			for(var next=curr+1;next<this.CN;next++){
				if(data_row[next]==data_row[curr]){
					data_row[next]=0;
					data_row[curr]*=2;
					this.score+=data_row[curr];
					break;
				}else{
					break;
				}
			}
		}
		// 再将数组倒转回来
		data_row=this.arrFrontToEnd(data_row);
		this.arr_verti_input(data_row,c);
	},
};
game.start();