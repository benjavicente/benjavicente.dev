module HelperC
  def helper_c
    puts "Hello, #{@user[:name]}"
  end
end

module HelperB
  include HelperC

  def helper_b
    helper_c
  end
end

class Controller
  include HelperB

  def initialize
      @user = { name: "John" }
  end

  def index
    helper_b
    helper_c
  end
end

controller = Controller.new
controller.index
