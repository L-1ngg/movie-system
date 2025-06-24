import time

# 定义一个用于测量函数执行时间的装饰器
def timer(func):
    def wrapper(*args, **kwargs): # 包装器函数
        start_time = time.time()
        result = func(*args, **kwargs) # 调用原始函数
        end_time = time.time()
        print(f"'{func.__name__}' took {end_time - start_time:.4f} seconds to execute.")
        return result
    return wrapper # 装饰器返回包装器函数

@timer
def my_function():
    # 模拟一些耗时操作
    time.sleep(0.1)
    print("my_function executed!")

@timer
def another_function(name):
    # 模拟另一些耗时操作
    time.sleep(0.2)
    print(f"{name} executed!")

my_function()
another_function("another_function_with_arg")