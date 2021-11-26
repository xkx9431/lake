package main

import (
	"github.com/merico-dev/lake/logger"
	lakeModels "github.com/merico-dev/lake/models"
	"github.com/merico-dev/lake/plugins/ae/models"
)

func (plugin AE) Init() {
	logger.Info("INFO >>> init go plugin", true)
	err := lakeModels.Db.AutoMigrate(
		&models.AEProject{},
		&models.AEMergeRequest{},
		&models.AECommit{},
		&models.AEPipeline{},
		&models.AEReviewer{},
		&models.AEMergeRequestNote{},
		&models.AEMergeRequestCommit{},
		&models.AEMergeRequestCommitMergeRequest{})
	if err != nil {
		logger.Error("Error migrating ae: ", err)
		panic(err)
	}
}
