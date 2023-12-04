## 基础语法

* 大小写敏感：java是大小写敏感，意味标识符Hello和hello不同。
* 类名：对于所有的类来说，类名的首字母应该大写。如果类名由若干单词组成，那每个单词的首字母应该大写。
* 方法名：所有的方法名都应该以小写字母开头，如果方法名含有若干单词，则后面的每个单词首字母大写。
* 源文件名：源文件名必须和类名相同。当保存文件的时候，你应该使用类名作为文件名保存。
* 主方法入口：所有的java程序由public static void main(String[] arg)方法开始执行。
  
## 修饰符

#### 访问控制修饰符
* default:在同一包内可见,不使用任何修饰符。使用对象：类、接口、变量、方法
* private:在同一类内可见,使用对象：变量、方法。注意：不能修饰类。
* public:对所有类可见。使用对象：类、接口、变量、方法。
* protected:对同一包内的类和所有类可见。使用对象：变量、方法。

#### 非访问修饰符
static修饰符：用来修饰类方法和类变量
* 静态变量：static关键字用来声明独立于对象的静态变量，无论一个类实例化多少对象，它的静态变量只有一份拷贝。静态变量也被称为类变量。局部变量不能被声明为static变量。
* 静态方法：static关键字用来独立于对象的静态方法。静态方法不能使用类的非静态变量。静态方法从参数列表得到数据，然后计算这些数据。

final修饰符
final表示最后的、最终的含义，变量一旦赋值后，不能被重新赋值。被final修饰的实例变量必须显式指定初始值。

abstract修饰符
抽象类：
抽象类不能用来实例化对象，声明抽象类的唯一目的是为了将来对该类进行扩充。
一个类不能同时被abstract和final修饰。如果一个类包含抽象方法，那么改类一定要声明为抽象类，否则将出现编译错误。

synchronized修饰符
synchronized关键字声明的方法同一时间只能被一个线程访问。synchronized修饰符可以应用于四个访问修饰符。

transient修饰符
序列化的对象包含被transient修饰的实例化变量时，java虚拟机跳过该特定的变量。

volatile修饰符
volatile修饰的成员变量在每次被线程访问时，都强制从共享内存中重新读取该成员变量的值，当成员变量发生变化时，会强
制线程将变化值回写到共享内存，这样在任何时刻，两个不同的线程总是看到某个成员变量的同一个值。

#### ArrayList
ArrayList类是一个可以动态修改的数组，与普通数组的区别就是它是没有固定大小限制，我们可以添加或删除元素。
ArrayList继承了AbstractList,并实现了List接口。

* add()添加元素
* get()访问元素
* set()修改元素
* remove()删除元素

## LinkedList
链表是一种常见的数据结构，是一种线性表，但是并不会按线性的顺序储存数据结构，而是在每一个节点里存到下一个节点的地址。
链表可分为单链表和双向链表。
与ArrayList相比，LinkedList的增加和删除的操作效率更高，而查找和修改的操作效率较低。

以下情况使用ArrayList:
* 频繁访问列表中的某个元素。
* 只需要在列表尾进行添加和删除元素操作。

以下情况使用LinkedList：
* 你需要通过循环迭代来访问列表中的某些元素。
* 需要频繁的在列表开头、中间、末尾等位置进行删除和添加元素操作。
```java
    import java.util.LinkedList;
    public class LinkList {
        public static void main(String[] args) {
            LinkedList<String> list =new LinkedList<String>();
            list.add("google");
            list.addFirst("baidu"); //在头部添加元素
            list.addLast('wwww'); //在列表尾部添加元素
            list.removeFirst();//移除头部元素
            list.removeLast();//移除尾部元素    
            //迭代元素
            for(int i =0;i <list.size();i++) {
                System.out.println(list.get(i));
            }  
        }
    }
```

## HashSet
HashSet基于HashMap来实现的，是一个不允许有重复元素的集合。
HashSet允许有null值。
HashSet是无序的，即不会记录插入的顺序。
HashSet不是线程安全的，如果多个线程同时修改HashSet，最终结果是不确定的。必须在多线程访问时显示同步对HashSet的并发访问。
HashSet实现了Set接口。

## HashMap
HashMap是一个散列表，它储存的内容是键值对映射。
HashMap实现了Map接口，根据键的HashCode值存储数据，具有很快的访问速度，最多允许一条记录的键为null，不支持线程同步。
HashMap是无序的，即不会记录插入的顺序。
HashMap继承于AbstractMap,实现了Map、Cloneable、java.io.Serializable接口。

## Iterator(迭代器)
Java迭代器是Java集合框架的一种机制，是一种用于遍历集合的接口。
它提供了一种统一的方式来访问集合中的元素，而不需要了解底层集合的具体实现细节。
Java Iterator不是一个集合，它是一种用于访问集合的方法，可用于迭代ArrayList和HashSet等集合。
Iterator是Java迭代器最简单的实现，ListIterator是Collection API中的接口，它扩展了Iterator接口。

以下为最常用的方法：
* next()-返回迭代器的下一个元素，并将迭代器的指针移到下一个位置。
* hashNext()-用于判断集合中是否还有下一个元素可访问。
* remove()-从集合中删除迭代器最后访问的元素（可选操作）。

```java
import java.util.ArrayList;
import java.util.Iterator;
//删除小于12的元素
class IteratorCl {
    public static void main(String[] args) {
        ArrayList<Integer> arList = new ArrayList<Integer>();
        arList.app(20);
        arList.app(10);
        Iterator<Integer> site = arList.iterator();
        while(site.hasNext()) {
            Integer iL = site.next();
            if(iL < 12) {
                site.remove();
            }
        }
    }
}
```
注意：Java迭代器是一种单向遍历机制，即只能从前往后遍历集合中的元素，不能往回遍历。同时，在使用迭代器遍历集合时，不能直接修改集合中的元素，
而是需要使用迭代器的remove()方法来删除当前元素。
迭代器和for循环的区别。
for循环在遍历的过程中不能对集合进行元素的增删改操作。

## 练习