package main // must be main for plugin entry point

import (
	"context"
	"fmt"

	"github.com/merico-dev/lake/logger"
	"github.com/merico-dev/lake/plugins/core"
	"github.com/merico-dev/lake/plugins/jiradomain/tasks"
	"github.com/mitchellh/mapstructure"
)

type JiraDomainOptions struct {
	SourceId uint64   `json:"sourceId"`
	BoardId  uint64   `json:"boardId"`
	Tasks    []string `json:"tasks,omitempty"`
}

// plugin interface
type JiraDomain string

func (plugin JiraDomain) Init() {
}

func (plugin JiraDomain) Description() string {
	return "Convert Jira Entities to Domain Layer Entities"
}

func (plugin JiraDomain) Execute(options map[string]interface{}, progress chan<- float32, ctx context.Context) error {
	// process options
	var op JiraDomainOptions
	var err error
	err = mapstructure.Decode(options, &op)
	if err != nil {
		return err
	}
	if op.SourceId == 0 {
		return fmt.Errorf("sourceId is invalid")
	}
	sourceId := op.SourceId
	if op.BoardId == 0 {
		return fmt.Errorf("boardId is invalid")
	}
	boardId := op.BoardId
	tasksToRun := make(map[string]bool, len(op.Tasks))
	for _, task := range op.Tasks {
		tasksToRun[task] = true
	}
	if len(tasksToRun) == 0 {
		tasksToRun = map[string]bool{
			"convertBoard":      true,
			"convertIssues":     true,
			"convertWorklogs":   true,
			"convertChangelogs": true,
			"convertUsers":      true,
			"convertSprints":    true,
		}
	}

	// run tasks
	logger.Print("start JiraDomain plugin execution")
	if tasksToRun["convertBoard"] {
		err := tasks.ConvertBoard(sourceId, boardId)
		if err != nil {
			return err
		}
	}
	if tasksToRun["convertUsers"] {
		err := tasks.ConvertUsers(sourceId)
		if err != nil {
			return err
		}
	}
	progress <- 0.01
	if tasksToRun["convertIssues"] {
		err = tasks.ConvertIssues(sourceId, boardId)
		if err != nil {
			return err
		}
	}
	progress <- 0.5
	if tasksToRun["convertWorklogs"] {
		err = tasks.ConvertWorklog(sourceId, boardId)
		if err != nil {
			return err
		}
	}
	progress <- 0.7
	if tasksToRun["convertChangelogs"] {
		err = tasks.ConvertChangelogs(sourceId, boardId)
		if err != nil {
			return err
		}
	}
	progress <- 0.8
	if tasksToRun["convertSprints"] {
		err = tasks.ConvertSprint(sourceId, boardId)
		if err != nil {
			logger.Error("convertSprints", err)
			return err
		}
	}

	progress <- 1
	logger.Print("end JiraDomain plugin execution")
	return nil
}

func (plugin JiraDomain) RootPkgPath() string {
	return "github.com/merico-dev/lake/plugins/jiradomain"
}

func (plugin JiraDomain) ApiResources() map[string]map[string]core.ApiResourceHandler {
	return make(map[string]map[string]core.ApiResourceHandler)
}

// Export a variable named PluginEntry for Framework to search and load
var PluginEntry JiraDomain //nolint
