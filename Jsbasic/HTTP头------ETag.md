#### 什么是ETag？

ETag：是实体标签（Entity Tag）的缩写。ETag一般不以明文形式相应给客户端。在资源的各个生命周期中，它都具有不同的值，用于标识出资源的状态。当资源发生变更时，如果其头信息中一个或者多个发生变化，或者消息实体发生变化，那么Etag也随之发生变化。

ETag值得变更说明资源状态已经被修改。往往可以通过时间戳就可以便宜的得到ETag头信息。在服务端中如果发回给消费者的相应从一开始就有ETag控制，那么可以确保更细粒度的Etag升级完全由服务进行控制。服务计算Etag值，并在相应客户端请求时将它返回给客户端。

#### 计算Etag值

在HTTP1.1协议中并没有规范如何计算Etag。Etag值可以是唯一标识资源的任何东西，如何久化存储中的某个资源关联的版本、一个或者多个文件属性，实体头信息和校验值、（CheckSum），也可以计算实体信息的散列值。有时候，为了计算一个ETag值可能有比较大的代价，此时可以采用生产唯一值等方式（如常见的GUID）。无论怎样，服务都应该尽可能的将ETag值返回给客户端。客户端不用关心ETag值如何产生，只要能服务在资源状态发生变更的情况下将ETag值发送给它就行。

##### ETag的类型以及他们之间的区别

ETag有两种类型：强ETag与弱ETag
强ETag表示形式："22FAA065-2664-4197-9C5E-C92EA03D0A16"。
弱ETag表现形式：w/"22FAA065-2664-4197-9C5E-C92EA03D0A16"。

强、弱Etag类型的出现与Apache服务器计算ETag的方式有关。Apache默认通过FileEtag中FileEtag INode Mtime Size的配置自动生成ETag(当然也可以通过用户自定义的方式)。假设服务端的资源频繁被修改(如1秒内修改了N次)，此时如果有用户将Apache的配置改为MTime，由于MTime只能精确到秒，那么就可以避免强ETag在1秒内的ETag总是不同而频繁刷新Cache(如果资源在秒级经常被修改，也可以通过Last-Modified来解决)。

#### ETag与Last-Modified头信息用途上的区别

按照HTTP标准，Last-Modified只能精准到秒级。ETag的出现可以很好的解决这个问题。在用途上，ETag常与if-None-Match或者If-Match一起，有客户端通过HTTP头信息（包括ETAg值）发送给服务端处理。ETag使用如下：
Get /Order/36 Http1.1
If-Match:"22FAA065-2664-4197-9C5E-C92EA03D0A16"
或If-None-Match:"22FAA065-2664-4197-9C5E-C92EA03D0A16"

Last-Modified常与If-Modified-Since一起由客户端将Last-Modified值包括在HTTP头信息中发给服务端进行处理。
其使用如下：
If-Modified-Since:Sat,24 Dec 2011 11:55:36 GMT